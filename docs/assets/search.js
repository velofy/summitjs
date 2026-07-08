/*
 * The Summit docs command palette.
 *
 * Registers a `search` component (native JS, so it can fetch and do async work)
 * that powers the Cmd+K / Ctrl+K palette. Full-text over a prebuilt index, no
 * external service. Registered on `summit:init` so it exists before Summit
 * initializes the page, regardless of script order.
 *
 * The index is prefetched on load, so opening is instant. If it has not arrived
 * yet the palette shows a loader; otherwise it shows Recent + Suggested pages so
 * it is never blank. The search-root element carries a `data-base` attribute
 * (the path prefix back to the docs root: "" on the homepage, "../" on a docs
 * page); result URLs are built from that base plus each entry's slug.
 */
(function () {
  var RECENT_KEY = "summit-recent";
  var SUGGESTED = ["start", "installation", "reactivity-state", "s-data", "events", "advanced-migrating"];

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
        isLoading: true,
        query: "",
        results: [],
        active: 0,
        recent: [],
        suggested: [],
        index: null,

        base: function () {
          var b = this.$el ? this.$el.getAttribute("data-base") : null;
          return b == null ? "../" : b;
        },

        url: function (slug, anchor) {
          return this.base() + slug + "/" + (anchor ? "#" + anchor : "");
        },

        buildSuggested: function () {
          var self = this;
          var idx = this.index || [];
          this.suggested = SUGGESTED.map(function (slug) {
            var e = idx.find(function (x) { return x.slug === slug && !x.anchor; }) ||
              idx.find(function (x) { return x.slug === slug; });
            return e ? { heading: e.page, page: e.category, slug: e.slug, anchor: "", url: self.url(e.slug, "") } : null;
          }).filter(Boolean);
        },

        hydrateRecent: function () {
          var self = this;
          this.recent = loadRecent().map(function (r) {
            return { heading: r.heading, page: r.page, slug: r.slug, anchor: r.anchor, url: self.url(r.slug, r.anchor) };
          });
        },

        // The flat list the keyboard navigates: results when searching, else
        // Recent followed by Suggested.
        current: function () {
          return this.query ? this.results : this.recent.concat(this.suggested);
        },

        init: function () {
          this.hydrateRecent();
          // Prefetch the search index during idle time instead of eagerly on
          // load: the index is ~62KB gzip + a big JSON parse, and most landing
          // visitors never search. Idle prefetch keeps "open" instant without
          // competing with first paint; open() also loads on demand as a fallback.
          var self = this;
          var prefetch = function () { self.load(); };
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(prefetch, { timeout: 3000 });
          } else {
            setTimeout(prefetch, 1500);
          }
        },

        // Populates `index` (prefetched on load). `isLoading` stays true until
        // both the index and the Suggested list are ready, then flips to false,
        // which is what reveals the results, so they never render half-built.
        load: function () {
          var self = this;
          if (this.index) {
            this.buildSuggested();
            this.isLoading = false;
            return Promise.resolve();
          }
          if (this._loading) return this._loading;
          if (typeof window !== "undefined" && window.__SUMMIT_SEARCH_INDEX__) {
            this.index = window.__SUMMIT_SEARCH_INDEX__;
            this.buildSuggested();
            this.isLoading = false;
            this._loading = Promise.resolve();
            return this._loading;
          }
          this.isLoading = true;
          var done = function (data) {
            self.index = data;
            self.buildSuggested();
            self.isLoading = false;
          };
          try {
            this._loading = fetch(this.base() + "search-index.json")
              .then(function (r) { return r.json(); })
              .then(done)
              .catch(function () { self.index = []; self.isLoading = false; });
          } catch (e) {
            self.index = [];
            self.isLoading = false;
            this._loading = Promise.resolve();
          }
          return this._loading;
        },

        open: function () {
          var self = this;
          // Open instantly; the loader covers the (usually already finished) fetch.
          this.isOpen = true;
          this.query = "";
          this.results = [];
          this.active = 0;
          this.hydrateRecent();
          this.load();
          this.$nextTick(function () {
            var el = self.$refs.input;
            if (el) el.focus();
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
          var list = this.current();
          if (!list.length) return;
          this.active = (this.active + dir + list.length) % list.length;
        },

        go: function () {
          var r = this.current()[this.active];
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
