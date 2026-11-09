import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
// src/adapters/event-target/shared.ts
/**
* Emitted by the EventTarget adapter when an inbound event fails to parse
* (`kind: 'parse'`) or the underlying target dispatches an `error`
* (`kind: 'fatal'`). This adapter is generic (it also backs WebSocket-style
* targets), so the event is named generically rather than worker-specific.
* Has a stable id so it can be subscribed to across module boundaries.
*/
const adapterErrorEvent = defineEventa("eventa:adapter:error");
// src/adapters/event-target/index.ts
function withRemoval(eventTarget, type, listener) {
	eventTarget.addEventListener(type, listener);
	return { remove: () => eventTarget.removeEventListener(type, listener) };
}
function createContext(eventTarget, options) {
	const ctx = createContext$1(options?.context);
	const { messageEventName = "message", errorEventName = "error", extraListeners = {} } = options || {};
	const cleanupRemoval = [];
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		eventTarget.dispatchEvent(new CustomEvent(messageEventName || "event", {
			detail: inner,
			bubbles: true,
			cancelable: true
		}));
	});
	if (messageEventName) cleanupRemoval.push(withRemoval(eventTarget, messageEventName, (event) => {
		try {
			const inner = restoreInner(event.detail);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { event } }).catch((emitError) => console.error("Failed to emit EventTarget message:", emitError));
		} catch (error) {
			console.error("Failed to parse EventTarget message:", error);
			ctx.emit(adapterErrorEvent, {
				kind: "parse",
				error: toError(error, "eventa: EventTarget message parse error")
			}, { raw: { event } }).catch((emitError) => console.error("Failed to emit EventTarget parse error:", emitError));
		}
	}));
	if (errorEventName) cleanupRemoval.push(withRemoval(eventTarget, errorEventName, (event) => {
		ctx.emit(adapterErrorEvent, {
			kind: "fatal",
			error: toError(event, "eventa: EventTarget error")
		}, { raw: { event } }).catch((emitError) => console.error("Failed to emit EventTarget error:", emitError));
	}));
	for (const [eventName, listener] of Object.entries(extraListeners)) cleanupRemoval.push(withRemoval(eventTarget, eventName, listener));
	return {
		context: ctx,
		dispose: (reason) => {
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, EventTarget adapter disposed"));
			cleanupRemoval.forEach((removal) => removal.remove());
		}
	};
}
export { adapterErrorEvent, createContext };

//# sourceMappingURL=index.mjs.map