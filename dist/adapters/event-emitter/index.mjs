import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
// src/adapters/event-emitter/shared.ts
const errorEvent = { ...defineEventa() };
// src/adapters/event-emitter/index.ts
function withRemoval(eventTarget, type, listener) {
	eventTarget.on(type, listener);
	return { remove: () => eventTarget.off(type, listener) };
}
function createContext(eventTarget, options) {
	const ctx = createContext$1(options?.context);
	const { messageEventName = "message", errorEventName = "error", extraListeners = {} } = options || {};
	const cleanupRemoval = [];
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (messageEventName && inner) eventTarget.emit(messageEventName, inner);
	});
	if (messageEventName) cleanupRemoval.push(withRemoval(eventTarget, messageEventName, (event) => {
		try {
			const inner = restoreInner(event);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { event } }).catch((emitError) => console.error("Failed to emit EventEmitter message:", emitError));
		} catch (error) {
			console.error("Failed to parse EventEmitter message:", error);
			ctx.emit(errorEvent, { error }, { raw: { event } }).catch((emitError) => console.error("Failed to emit EventEmitter parse error:", emitError));
		}
	}));
	if (errorEventName) cleanupRemoval.push(withRemoval(eventTarget, errorEventName, (error) => {
		ctx.emit(errorEvent, { error }, { raw: { event: error } }).catch((emitError) => console.error("Failed to emit EventEmitter error:", emitError));
	}));
	for (const [eventName, listener] of Object.entries(extraListeners)) cleanupRemoval.push(withRemoval(eventTarget, eventName, listener));
	return {
		context: ctx,
		dispose: (reason) => {
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, EventEmitter adapter disposed"));
			cleanupRemoval.forEach((removal) => removal.remove());
		}
	};
}
export { createContext };

//# sourceMappingURL=index.mjs.map