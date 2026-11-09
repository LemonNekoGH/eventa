import { n as EventContext, t as CreateContextOptions } from "../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../errors-D-UL5Ncb.mjs";
import { a as normalizeOnListenerParameters, i as isWorkerEventa, n as WorkerEventa, o as workerErrorEvent, r as defineWorkerEventa, t as WorkerContextExtensions } from "../../shared-M3VUBVNh.mjs";
/** Creates an Eventa Context backed by a browser Worker. */
export interface WebWorkerAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
/** Worker metadata and transferables available while emitting an Eventa. */
export interface WebWorkerEmitOptions {
  raw: {
    message?: MessageEvent;
    error?: ErrorEvent;
    messageError?: MessageEvent;
  };
  transfer?: Transferable[];
}
export declare function createContext(worker: Worker, options?: WebWorkerAdapterOptions): {
  context: EventContext<WorkerContextExtensions, WebWorkerEmitOptions>;
};
export { type AdapterErrorKind, type AdapterErrorPayload, type WorkerContextExtensions, type WorkerEventa, defineWorkerEventa, isWorkerEventa, type normalizeOnListenerParameters, workerErrorEvent };
//# sourceMappingURL=index.d.mts.map