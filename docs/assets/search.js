/*
 * The Summit docs command palette.
 *
 * Registers a `search` component (native JS, so it can fetch and do async work)
 * that powers the Cmd+K / Ctrl+K palette. Full-text over a prebuilt index, no
 * external service. Registered on `summit:init` so it exists before Summit
 * initializes the page, regardless of script order.
 *
 * The search-root element carries a `data-base` attribute (the path prefix back
 * to the docs root: "" on the homepage, "../" on a docs page). Result URLs are
 * built from that base plus each entry's slug, so one index serves every page.
 */
(function () {
  var RECENT_KEY = "summit-recent";

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(text, terms) {
    var out = escapeHtml(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function loadRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function register() {
    if (!window.Summit) return;
    window.Summit.data("search", function () {
      return {
        isOpen: false,
        query: "",
        results: [],
        active: 0,
        recent: [],
        index: null,

        base: function () {
          // data-base may be "" (homepage) which is meaningful, so distinguish
          // an absent attribute (null) from a present empty one.
          var b = this.$el ? this.$el.getAttribute("data-base") : null;
          return b == null ? "../" : b;
        },

        url: function (slug, anchor) {
          return this.base() + slug + "/" + (anchor ? "#" + anchor : "");
        },

        hydrateRecent: function () {
          var self = this;
          this.recent = loadRecent().map(function (r) {
            return { heading: r.heading, page: r.page, slug: r.slug, anchor: r.anchor, url: self.url(r.slug, r.anchor) };
          });
        },

        init: function () {
          this.load();
          this.hydrateRecent();
        },

        load: function () {
          var self = this;
          if (this._loading || this.index) return this._loading;
          // A self-contained preview (Artifact) can inline the index as a global
          // to avoid a blocked fetch.
          if (typeof window !== "undefined" && window.__SUMMIT_SEARCH_INDEX__) {
            this.index = window.__SUMMIT_SEARCH_INDEX__;
            this._loading = Promise.resolve();
            return this._loading;
          }
          try {
            this._loading = fetch(this.base() + "search-index.json")
              .then(function (r) { return r.json(); })
              .then(function (data) { self.index = data; })
              .catch(function () { self.index = []; });
          } catch (e) {
            self.index = [];
            this._loading = Promise.resolve();
          }
          return this._loading;
        },

        open: function () {
          var self = this;
          Promise.resolve(this.load()).then(function () {
            self.isOpen = true;
            self.query = "";
            self.results = [];
            self.active = 0;
            self.hydrateRecent();
            self.$nextTick(function () {
              var el = self.$refs.input;
              if (el) el.focus();
            });
          });
        },

        close: function () {
          this.isOpen = false;
        },

        run: function () {
          var self = this;
          var q = this.query.trim().toLowerCase();
          this.active = 0;
          if (!q) {
            this.results = [];
            return;
          }
          var terms = q.split(/\s+/).filter(Boolean);
          var scored = [];
          var idx = this.index || [];
          for (var i = 0; i < idx.length; i++) {
            var e = idx[i];
            var score = 0;
            for (var j = 0; j < terms.length; j++) {
              var t = terms[j];
              if (e.heading.toLowerCase().indexOf(t) !== -1) score += 4;
              if (e.page.toLowerCase().indexOf(t) !== -1) score += 2;
              if (e.text.indexOf(t) !== -1) score += 1;
            }
            if (score > 0) scored.push({ e: e, score: score });
          }
          scored.sort(function (a, b) { return b.score - a.score; });
          this.results = scored.slice(0, 24).map(function (s) {
            return {
              page: s.e.page,
              slug: s.e.slug,
              anchor: s.e.anchor,
              url: self.url(s.e.slug, s.e.anchor),
              heading: s.e.heading,
              titleHtml: highlight(s.e.heading, terms),
              snippetHtml: highlight(s.e.snippet, terms),
            };
          });
        },

        move: function (dir) {
          var list = this.query ? this.results : this.recent;
          if (!list.length) return;
          this.active = (this.active + dir + list.length) % list.length;
        },

        go: function () {
          var list = this.query ? this.results : this.recent;
          var r = list[this.active];
          if (r) {
            this.remember(r);
            location.href = r.url;
          }
        },

        remember: function (r) {
          var item = { heading: r.heading, page: r.page, slug: r.slug, anchor: r.anchor };
          var list = loadRecent().filter(function (x) { return !(x.slug === item.slug && x.anchor === item.anchor); });
          list.unshift(item);
          list = list.slice(0, 5);
          try {
            localStorage.setItem(RECENT_KEY, JSON.stringify(list));
          } catch (e) {
            void e;
          }
        },
      };
    });
  }

  document.addEventListener("summit:init", register);
})();
