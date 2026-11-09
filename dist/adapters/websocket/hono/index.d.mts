import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../../context-BCSkPp2Y.mjs";
import { T as InvocableEventContext } from "../../../index-7TfxO-tl.mjs";
import { WSEvents } from "hono/ws";
export declare const wsConnectedEvent: Eventa<undefined, undefined, undefined>;
export declare const wsDisconnectedEvent: Eventa<undefined, undefined, undefined>;
export declare const wsErrorEvent: Eventa<{
  error: unknown;
}, undefined, undefined>;
type HonoWsOpenEvent = Parameters<NonNullable<WSEvents['onOpen']>>[0];
type HonoWsMessageEvent = Parameters<NonNullable<WSEvents['onMessage']>>[0];
type HonoWsCloseEvent = Parameters<NonNullable<WSEvents['onClose']>>[0];
type HonoWsErrorEvent = Parameters<NonNullable<WSEvents['onError']>>[0];
interface HonoWsRawEventOptions {
  raw?: {
    close?: HonoWsCloseEvent;
    error?: HonoWsErrorEvent;
    message?: HonoWsMessageEvent;
    open?: HonoWsOpenEvent;
  };
}
type HonoWsEventContext = EventContext<undefined, HonoWsRawEventOptions>;
type HonoWsInvocableEventContext = InvocableEventContext<undefined, HonoWsRawEventOptions>;
interface GlobalHooksResult {
  context: HonoWsEventContext;
  hooks: WSEvents;
}
interface CreateGlobalHooksOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
/**
 * Creates Hono `WSEvents` hooks backed by one shared broadcasting context.
 *
 * Use when:
 * - A server needs one Eventa context that broadcasts outbound events to every
 *   connected Hono WebSocket peer.
 *
 * Expects:
 * - Connected peers accept the standard Eventa websocket JSON wire format.
 *
 * Returns:
 * - A shared context plus Hono websocket hooks.
 */
export declare function createGlobalHooks(options?: CreateGlobalHooksOptions): GlobalHooksResult;
interface CreatePeerHooksOptions {
  /** Delivery deduplication and hop policy for each created Context. */
  context?: CreateContextOptions;
  onContext?: (ctx: HonoWsInvocableEventContext) => void;
}
interface PeerHooksResult {
  hooks: WSEvents;
}
/**
 * Creates Hono `WSEvents` hooks with one Eventa context per connected peer.
 *
 * Use when:
 * - A Hono route wants per-socket Eventa RPC handlers or per-peer fanout.
 *
 * Expects:
 * - The returned hooks are passed to Hono's `upgradeWebSocket(...)` helper.
 *
 * Returns:
 * - Hono websocket hooks. `options.onContext` receives the peer context after
 *   `onOpen`, when Hono exposes the `WSContext`.
 */
export declare function createPeerHooks(options?: CreatePeerHooksOptions): PeerHooksResult;
export type { CreateGlobalHooksOptions, CreatePeerHooksOptions, GlobalHooksResult, HonoWsCloseEvent, HonoWsErrorEvent, HonoWsEventContext, HonoWsInvocableEventContext, HonoWsMessageEvent, HonoWsOpenEvent, HonoWsRawEventOptions, PeerHooksResult };
//# sourceMappingURL=index.d.mts.map