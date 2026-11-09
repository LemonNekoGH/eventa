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
/** Creates an Eventa Context backed by a BroadcastChannel. */
export interface BroadcastChannelAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /**
   * Whether to listen to `message` events.
   * @default true
   */
  messageEvents?: boolean;
  /**
   * Whether to listen to `messageerror` events.
   * @default true
   */
  messageErrorEvents?: boolean;
  /**
   * Whether to close the BroadcastChannel when disposing the context.
   * @default false
   */
  closeOnDispose?: boolean;
}
/** Raw BroadcastChannel metadata exposed to Eventa listeners. */
export interface BroadcastChannelEmitOptions {
  raw: {
    message?: MessageEvent;
    messageError?: MessageEvent;
    error?: unknown;
  };
}
export declare function createContext(channel: BroadcastChannel, options?: BroadcastChannelAdapterOptions): {
  context: EventContext<undefined, BroadcastChannelEmitOptions>;
  dispose: (reason?: unknown) => void;
};
export type { errorEvent };
//# sourceMappingURL=index.d.mts.map