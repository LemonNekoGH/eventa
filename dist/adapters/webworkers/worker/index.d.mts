import { n as EventContext, t as CreateContextOptions } from "../../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../../errors-D-UL5Ncb.mjs";
import { o as workerErrorEvent, t as WorkerContextExtensions } from "../../../shared-M3VUBVNh.mjs";
/** Creates an Eventa Context backed by a worker-global message port. */
export interface WebWorkerSelfAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** Worker-compatible port used for messaging. @default self */
  messagePort?: Omit<Worker, 'close' | 'start'>;
}
/** Worker-global metadata and transferables available while emitting an Eventa. */
export interface WebWorkerSelfEmitOptions {
  raw: {
    event?: unknown;
    error?: string | Event;
  };
  transfer?: Transferable[];
}
export declare function createContext(options?: WebWorkerSelfAdapterOptions): {
  context: EventContext<WorkerContextExtensions, WebWorkerSelfEmitOptions>;
};
export { type AdapterErrorKind, type AdapterErrorPayload, workerErrorEvent };
//# sourceMappingURL=index.d.mts.map