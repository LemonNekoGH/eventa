import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../errors-D-UL5Ncb.mjs";
import { Event, EventTarget } from "@tauri-apps/api/event";
/**
 * Emitted when a Tauri message cannot be parsed or an invoke cannot be sent.
 * A malformed message does not abort the context because the underlying Tauri
 * event transport is still usable.
 */
export declare const errorEvent: Eventa<AdapterErrorPayload, undefined, undefined>;
export type TauriTarget = string | EventTarget;
export interface TauriAdapterOptions {
  /** Fixed target for every outbound Eventa message. */
  target: TauriTarget;
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** Target whose messages this context receives. Defaults to the current webview's label. */
  listenTarget?: TauriTarget;
  /** Use the same name on both peers and a distinct name for each peer pair. @default "eventa-message" */
  messageEventName?: string;
}
export interface TauriEmitOptions {
  raw: {
    event: Event<unknown>;
  };
}
export declare function createContext(options: TauriAdapterOptions): Promise<{
  context: EventContext<undefined, TauriEmitOptions>;
  dispose: (reason?: unknown) => Promise<void>;
}>;
export type { AdapterErrorKind, AdapterErrorPayload };
//# sourceMappingURL=index.d.mts.map