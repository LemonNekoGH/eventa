import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../context-BCSkPp2Y.mjs";
import { n as AdapterErrorPayload, t as AdapterErrorKind } from "../../errors-D-UL5Ncb.mjs";
interface WindowMessageEnvelope<T> {
  __eventa: true;
  channel: string;
  sourceId: string;
  payload: T;
}
/**
 * Emitted by the window-message adapter when an inbound message fails to parse
 * (`kind: 'parse'`) or the window dispatches a `messageerror`
 * (`kind: 'messageerror'`). Neither is fatal — the window itself stays alive,
 * so the context is not aborted. Has a stable id so it can be subscribed to
 * across module boundaries.
 */
export declare const errorEvent: Eventa<AdapterErrorPayload, undefined, undefined>;
/** Creates an Eventa Context backed by a window-message channel. */
export interface WindowMessageAdapterOptions {
  channel: string;
  currentWindow: Window;
  targetWindow: () => Window | null | undefined;
  context?: CreateContextOptions;
  expectedSource?: () => MessageEventSource | null | undefined;
  targetOrigin?: string;
  expectedOrigin?: string | ((origin: string) => boolean);
  acceptMessage?: (event: MessageEvent<unknown>) => boolean;
  messageEvents?: boolean;
  messageErrorEvents?: boolean;
}
/** Raw window-message metadata exposed to Eventa listeners. */
export interface WindowMessageEmitOptions {
  raw: {
    message?: MessageEvent;
    messageError?: MessageEvent;
    error?: unknown;
  };
}
export declare function createContext(options: WindowMessageAdapterOptions): {
  context: EventContext<undefined, WindowMessageEmitOptions>;
  dispose: (reason?: unknown) => void;
};
export type { AdapterErrorKind, AdapterErrorPayload, WindowMessageEnvelope };
//# sourceMappingURL=index.d.mts.map