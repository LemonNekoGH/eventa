import { _ as matchBy, m as defineEventa, o as createContext, p as and } from "../../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../../internal-BK_9UiZq.mjs";
// src/adapters/websocket/hono/internal.ts
/**
* Reads a Hono WebSocket payload as text.
*
* @example
* await readMessageText('hello')
* // => 'hello'
*/
async function readMessageText(data) {
	if (typeof data === "string") return data;
	if (data instanceof Blob) return data.text();
	if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
	if (ArrayBuffer.isView(data)) return new TextDecoder().decode(data);
	throw new TypeError("Unsupported Hono websocket message payload");
}
// src/adapters/websocket/hono/shared.ts
const wsConnectedEvent = defineEventa("eventa:adapters:hono-ws:connected");
const wsDisconnectedEvent = defineEventa("eventa:adapters:hono-ws:disconnected");
const wsErrorEvent = defineEventa("eventa:adapters:hono-ws:error");
// src/adapters/websocket/hono/global.ts
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
function createGlobalHooks(options = {}) {
	const context = createContext(options.context);
	const peers = /* @__PURE__ */ new Set();
	context.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const data = JSON.stringify(inner);
		for (const peer of peers) peer.send(data);
	});
	return {
		context,
		hooks: {
			onOpen(event, ws) {
				peers.add(ws);
				context.emit(wsConnectedEvent, void 0, { raw: { open: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket open event:", emitError));
			},
			onMessage(event) {
				readMessageText(event.data).then((message) => restoreInner(JSON.parse(message))).then((inner) => context.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }), (error) => {
					console.error("Failed to parse WebSocket message:", error);
					return context.emit(wsErrorEvent, { error }, { raw: { message: event } });
				}).catch((emitError) => console.error("Failed to emit Hono WebSocket message:", emitError));
			},
			onClose(event, ws) {
				peers.delete(ws);
				context.emit(wsDisconnectedEvent, void 0, { raw: { close: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket close event:", emitError));
			},
			onError(event) {
				context.emit(wsErrorEvent, { error: event }, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket error:", emitError));
			}
		}
	};
}
// src/adapters/websocket/hono/peer.ts
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
function createPeerHooks(options = {}) {
	let context;
	let stopSending;
	return { hooks: {
		onOpen(event, ws) {
			const ctx = createContext(options.context);
			context = ctx;
			stopSending = ctx.on(and(matchBy((eventa) => !("_flowDirection" in eventa) || !eventa._flowDirection || eventa._flowDirection === "outbound"), matchBy("*")), (eventa) => {
				const inner = createOutboundInner(eventa);
				if (inner) ws.send(JSON.stringify(inner));
			});
			ctx.emit(wsConnectedEvent, void 0, { raw: { open: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket open event:", emitError));
			options.onContext?.(ctx);
		},
		onMessage(event) {
			if (!context) return;
			const currentContext = context;
			readMessageText(event.data).then((message) => restoreInner(JSON.parse(message))).then((inner) => currentContext.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }), (error) => {
				console.error("Failed to parse WebSocket message:", error);
				return currentContext.emit(wsErrorEvent, { error }, { raw: { message: event } });
			}).catch((emitError) => console.error("Failed to emit Hono WebSocket message:", emitError));
		},
		onClose(event) {
			if (!context) return;
			stopSending?.();
			context.abort(/* @__PURE__ */ new Error("eventa: invoke cancelled, hono websocket disconnected"));
			context.emit(wsDisconnectedEvent, void 0, { raw: { close: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket close event:", emitError));
			context = void 0;
			stopSending = void 0;
		},
		onError(event) {
			if (!context) return;
			stopSending?.();
			context.abort(/* @__PURE__ */ new Error("eventa: invoke cancelled, hono websocket error"));
			context.emit(wsErrorEvent, { error: event }, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit Hono WebSocket error event:", emitError));
		}
	} };
}
export { createGlobalHooks, createPeerHooks, wsConnectedEvent, wsDisconnectedEvent, wsErrorEvent };

//# sourceMappingURL=index.mjs.map