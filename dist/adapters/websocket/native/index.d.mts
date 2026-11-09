import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../../context-BCSkPp2Y.mjs";
export declare const wsConnectedEvent: Eventa<{
  url: string;
}, undefined, undefined>;
export declare const wsDisconnectedEvent: Eventa<{
  url: string;
}, undefined, undefined>;
export declare const wsErrorEvent: Eventa<{
  error: unknown;
}, undefined, undefined>;
/** Creates an Eventa Context backed by a native WebSocket. */
export interface NativeWebSocketAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
/** Raw native WebSocket metadata exposed to Eventa listeners. */
export interface NativeWebSocketEmitOptions {
  raw: {
    message?: MessageEvent;
    open?: Event;
    error?: Event;
    close?: CloseEvent;
  };
}
export declare function createContext(wsConn: WebSocket, options?: NativeWebSocketAdapterOptions): {
  context: EventContext<undefined, NativeWebSocketEmitOptions>;
};
//# sourceMappingURL=index.d.mts.map