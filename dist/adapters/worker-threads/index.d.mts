import { n as EventContext, t as CreateContextOptions } from "../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../errors-D-UL5Ncb.mjs";
import { a as normalizeOnListenerParameters, i as isWorkerEventa, n as WorkerEventa, o as workerErrorEvent, r as defineWorkerEventa, t as WorkerContextExtensions } from "../../shared-M3VUBVNh.mjs";
import { Transferable, Worker } from "node:worker_threads";
/** Creates an Eventa Context backed by a Node.js Worker. */
export interface WorkerThreadAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
/** Worker-thread metadata and transferables available while emitting an Eventa. */
export interface WorkerThreadEmitOptions {
  raw: {
    message?: unknown;
    error?: unknown;
    messageError?: unknown;
  };
  transfer?: Transferable[];
}
export declare function createContext(worker: Worker, options?: WorkerThreadAdapterOptions): {
  context: EventContext<WorkerContextExtensions, WorkerThreadEmitOptions>;
};
export { type AdapterErrorKind, type AdapterErrorPayload, type WorkerContextExtensions, type WorkerEventa, defineWorkerEventa, isWorkerEventa, type normalizeOnListenerParameters, workerErrorEvent };
//# sourceMappingURL=index.d.mts.map