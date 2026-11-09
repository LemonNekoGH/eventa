import { m as EventaType, n as EventContext, t as CreateContextOptions } from "../../context-BCSkPp2Y.mjs";
declare const errorEvent: {
  body?: {
    error: unknown;
  } | undefined;
  metadata?: undefined;
  invokeMetadata?: undefined;
  id: string;
  type?: EventaType.Event | undefined;
};
/** Creates an Eventa Context backed by a Node.js EventEmitter. */
export interface EventEmitterAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** Event name carrying Eventa inner values, or `false` to disable ingress and egress. @default 'message' */
  messageEventName?: string | false;
  /** Event name dispatched as adapter errors, or `false` to disable it. @default 'error' */
  errorEventName?: string | false;
  /** Additional transport listeners removed when the adapter is disposed. @default {} */
  extraListeners?: Record<string, (...args: unknown[]) => void | Promise<void>>;
}
/** Raw EventEmitter metadata exposed to Eventa listeners. */
export interface EventEmitterEmitOptions {
  raw: {
    event: unknown;
  };
}
export declare function createContext(eventTarget: NodeJS.EventEmitter, options?: EventEmitterAdapterOptions): {
  context: EventContext<undefined, EventEmitterEmitOptions>;
  dispose: (reason?: unknown) => void;
};
export type { errorEvent };
//# sourceMappingURL=index.d.mts.map