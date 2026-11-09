import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../../internal-BK_9UiZq.mjs";
// src/adapters/websocket/native/index.ts
const wsConnectedEvent = defineEventa();
const wsDisconnectedEvent = defineEventa();
const wsErrorEvent = defineEventa();
function createContext(wsConn, options) {
	const ctx = createContext$1(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (inner) wsConn.send(JSON.stringify(inner));
	});
	wsConn.onmessage = (event) => {
		try {
			const inner = restoreInner(JSON.parse(String(event.data)));
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit WebSocket message:", emitError));
		} catch (error) {
			console.error("Failed to parse WebSocket message:", error);
			ctx.emit(wsErrorEvent, { error }, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit WebSocket parse error:", emitError));
		}
	};
	wsConn.onopen = (event) => void ctx.emit(wsConnectedEvent, { url: wsConn.url }, { raw: { open: event } }).catch((emitError) => console.error("Failed to emit WebSocket open event:", emitError));
	wsConn.onerror = (error) => {
		stopSending();
		ctx.abort(/* @__PURE__ */ new Error("eventa: invoke cancelled, websocket error"));
		ctx.emit(wsErrorEvent, { error }, { raw: { error } }).catch((emitError) => console.error("Failed to emit WebSocket error:", emitError));
	};
	wsConn.onclose = (close) => {
		stopSending();
		ctx.abort(/* @__PURE__ */ new Error(`eventa: invoke cancelled, websocket disconnected (${wsConn.url})`));
		ctx.emit(wsDisconnectedEvent, { url: wsConn.url }, { raw: { close } }).catch((emitError) => console.error("Failed to emit WebSocket close event:", emitError));
	};
	return { context: ctx };
}
export { createContext, wsConnectedEvent, wsDisconnectedEvent, wsErrorEvent };

//# sourceMappingURL=index.mjs.map