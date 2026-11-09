import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../errors-D-UL5Ncb.mjs";
/**
 * Emitted by the EventTarget adapter when an inbound event fails to parse
 * (`kind: 'parse'`) or the underlying target dispatches an `error`
 * (`kind: 'fatal'`). This adapter is generic (it also backs WebSocket-style
 * targets), so the event is named generically rather than worker-specific.
 * Has a stable id so it can be subscribed to across module boundaries.
 */
export declare const adapterErrorEvent: Eventa<AdapterErrorPayload, undefined, undefined>;
/** Creates an Eventa Context backed by an EventTarget. */
export interface EventTargetAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** DOM event name carrying Eventa inner values, or `false` to disable ingress. @default 'message' */
  messageEventName?: string | false;
  /** DOM event name dispatched as adapter errors, or `false` to disable it. @default 'error' */
  errorEventName?: string | false;
  /** Additional DOM listeners removed when the adapter is disposed. @default {} */
  extraListeners?: Record<string, (event: Event) => void | Promise<void>>;
}
/** Raw EventTarget metadata exposed to Eventa listeners. */
export interface EventTargetEmitOptions {
  raw: {
    event: CustomEvent | Event | unknown;
  };
}
export declare function createContext(eventTarget: EventTarget, options?: EventTargetAdapterOptions): {
  context: EventContext<undefined, EventTargetEmitOptions>;
  dispose: (reason?: unknown) => void;
};
export type { AdapterErrorKind, AdapterErrorPayload };
//# sourceMappingURL=index.d.mts.map