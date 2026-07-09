/**
 * The microtask scheduler.
 *
 * DOM-facing effects do not run synchronously on every write. They queue here
 * and flush once per microtask, so a burst of state changes produces a single
 * coalesced DOM update. `nextTick` resolves after that flush, which is how a
 * component can read the freshly-updated DOM.
 */

type Job = () => void;

let queue = new Set<Job>();
let flushing = false;
let flushPromise: Promise<void> | null = null;
const resolved = Promise.resolve();

/** Queue a job to run on the next microtask flush. Deduplicated. */
export function queueJob(job: Job): void {
  queue.add(job);
  if (!flushing) {
    flushing = true;
    flushPromise = resolved.then(flushJobs);
  }
}

function flushJobs(): void {
  // Drain by swapping the Set instead of copying it into an array: jobs queued
  // during the flush land in the fresh queue and run next tick, same as before.
  const jobs = queue;
  queue = new Set();
  flushing = false;
  flushPromise = null;
  for (const job of jobs) job();
}

/**
 * Resolve after the current flush completes. With a callback, runs it after the
 * flush; without one, returns a promise you can await.
 */
export function nextTick(callback?: () => void): Promise<void> {
  const p = flushPromise ?? resolved;
  return callback ? p.then(() => void callback()) : p.then(() => undefined);
}
