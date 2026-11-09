import { u as Eventa } from "./context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload } from "./errors-D-UL5Ncb.mjs";
interface WorkerContextExtensions {
  invokeRequest?: {
    transfer?: Transferable[];
  };
  invokeResponse?: {
    transfer?: Transferable[];
  };
}
interface WorkerEventa<T> extends Eventa<{
  message: T;
  transfer?: Transferable[];
}> {
  _workerTransfer: true;
}
declare function defineWorkerEventa<T>(id?: string): WorkerEventa<T>;
declare function isWorkerEventa(event: Eventa<unknown>): event is WorkerEventa<unknown>;
/**
 * Emitted by the worker adapters whenever a worker fails: an inbound message
 * fails to parse (`kind: 'parse'`, non-fatal), the worker hits a fatal
 * `error` (`kind: 'fatal'`), or a message can't be deserialized
 * (`kind: 'messageerror'`). Has a stable id so it can be subscribed to across
 * module boundaries.
 */
declare const workerErrorEvent: Eventa<AdapterErrorPayload, undefined, undefined>;
declare function normalizeOnListenerParameters<Transfer = Transferable>(event: Eventa<unknown>, options?: {
  transfer?: Transfer[];
} | unknown): {
  body: unknown;
  transfer: Transfer[] | undefined;
};
export { normalizeOnListenerParameters as a, isWorkerEventa as i, WorkerEventa as n, workerErrorEvent as o, defineWorkerEventa as r, WorkerContextExtensions as t };
//# sourceMappingURL=shared-M3VUBVNh.d.mts.map