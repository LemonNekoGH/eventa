import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
// src/adapters/broadcast-channel/shared.ts
const errorEvent = { ...defineEventa() };
// src/adapters/broadcast-channel/index.ts
function withRemoval(channel, type, listener) {
	channel.addEventListener(type, listener);
	return { remove: () => {
		channel.removeEventListener(type, listener);
	} };
}
function createContext(channel, options) {
	const ctx = createContext$1(options?.context);
	const { messageEvents: message = true, messageErrorEvents: messageError = true, closeOnDispose = false } = options || {};
	const cleanupRemoval = [];
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (inner) channel.postMessage(inner);
	});
	if (message) cleanupRemoval.push(withRemoval(channel, "message", (event) => {
		try {
			const inner = restoreInner(event.data);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit BroadcastChannel message:", emitError));
		} catch (error) {
			console.error("Failed to parse BroadcastChannel message:", error);
			ctx.emit(errorEvent, { error }, { raw: { error } }).catch((emitError) => console.error("Failed to emit BroadcastChannel parse error:", emitError));
		}
	}));
	if (messageError) cleanupRemoval.push(withRemoval(channel, "messageerror", (event) => {
		ctx.emit(errorEvent, { error: event }, { raw: { messageError: event } }).catch((emitError) => console.error("Failed to emit BroadcastChannel message error:", emitError));
	}));
	return {
		context: ctx,
		dispose: (reason) => {
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, BroadcastChannel disposed"));
			cleanupRemoval.forEach((removal) => removal.remove());
			if (closeOnDispose) channel.close?.();
		}
	};
}
export { createContext };

//# sourceMappingURL=index.mjs.map