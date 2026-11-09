import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
// src/adapters/window-message/shared.ts
/**
* Emitted by the window-message adapter when an inbound message fails to parse
* (`kind: 'parse'`) or the window dispatches a `messageerror`
* (`kind: 'messageerror'`). Neither is fatal — the window itself stays alive,
* so the context is not aborted. Has a stable id so it can be subscribed to
* across module boundaries.
*/
const errorEvent = defineEventa("eventa:window-message:error");
// src/adapters/window-message/index.ts
function withRemoval(currentWindow, type, listener) {
	currentWindow.addEventListener(type, listener);
	return { remove: () => currentWindow.removeEventListener(type, listener) };
}
function isEnvelope(value, channel) {
	return typeof value === "object" && value !== null && "__eventa" in value && value.__eventa === true && "channel" in value && value.channel === channel && "sourceId" in value && typeof value.sourceId === "string" && "payload" in value;
}
function matchOrigin(expectedOrigin, origin) {
	return typeof expectedOrigin === "function" ? expectedOrigin(origin) : expectedOrigin === origin;
}
function createContext(options) {
	const ctx = createContext$1(options.context);
	const sourceId = crypto.randomUUID();
	const { messageEvents: message = true, messageErrorEvents: messageError = true } = options;
	const cleanupRemoval = [];
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		options.targetWindow()?.postMessage({
			__eventa: true,
			channel: options.channel,
			sourceId,
			payload: inner
		}, options.targetOrigin ?? "*");
	});
	if (message) cleanupRemoval.push(withRemoval(options.currentWindow, "message", (event) => {
		if (!isEnvelope(event.data, options.channel)) return;
		const expectedSource = options.expectedSource?.();
		if (expectedSource && event.source !== expectedSource) return;
		if (options.expectedOrigin && !matchOrigin(options.expectedOrigin, event.origin)) return;
		if (event.data.sourceId === sourceId || options.acceptMessage && !options.acceptMessage(event)) return;
		try {
			const inner = restoreInner(event.data.payload);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit window message:", emitError));
		} catch (error) {
			console.error("Failed to parse window message:", error);
			ctx.emit(errorEvent, {
				kind: "parse",
				error: toError(error, "eventa: window message parse error")
			}, { raw: { error } }).catch((emitError) => console.error("Failed to emit window-message parse error:", emitError));
		}
	}));
	if (messageError) cleanupRemoval.push(withRemoval(options.currentWindow, "messageerror", (event) => {
		ctx.emit(errorEvent, {
			kind: "messageerror",
			error: toError(event, "eventa: window messageerror"),
			message: event
		}, { raw: { messageError: event } }).catch((emitError) => console.error("Failed to emit window message error:", emitError));
	}));
	return {
		context: ctx,
		dispose: (reason) => {
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, window message adapter disposed"));
			cleanupRemoval.forEach((removal) => removal.remove());
		}
	};
}
export { createContext, errorEvent };

//# sourceMappingURL=index.mjs.map