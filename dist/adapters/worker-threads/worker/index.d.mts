import { n as EventContext, t as CreateContextOptions } from "../../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../../errors-D-UL5Ncb.mjs";
import { o as workerErrorEvent, t as WorkerContextExtensions } from "../../../shared-M3VUBVNh.mjs";
import { MessagePort, Transferable } from "node:worker_threads";
/** Creates an Eventa Context backed by a Node.js worker MessagePort. */
export interface WorkerThreadSelfAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** Message port used for worker communication. @default parentPort */
  messagePort?: MessagePort;
}
/** Worker-side metadata and transferables available while emitting an Eventa. */
export interface WorkerThreadSelfEmitOptions {
  raw: {
    message?: unknown;
    error?: unknown;
    messageError?: unknown;
  };
  transfer?: Transferable[];
}
export declare function createContext(options?: WorkerThreadSelfAdapterOptions): {
  context: EventContext<WorkerContextExtensions, WorkerThreadSelfEmitOptions>;
};
export { type AdapterErrorKind, type AdapterErrorPayload, workerErrorEvent };
//# sourceMappingURL=index.d.mts.map