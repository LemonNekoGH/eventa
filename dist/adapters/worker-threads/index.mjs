import { _ as matchBy, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner } from "../../internal-BK_9UiZq.mjs";
import { a as workerErrorEvent, i as isWorkerEventa, n as restoreInner, r as defineWorkerEventa, t as createWorkerInnerEventa } from "../../internal-DwjkmlkQ.mjs";
// src/adapters/worker-threads/index.ts
function createContext(worker, options) {
	const ctx = createContext$1(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event, emitOptions) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const outgoing = createWorkerInnerEventa(inner, emitOptions);
		worker.postMessage(outgoing.inner, outgoing.transfer);
	});
	worker.on("message", (message) => {
		try {
			const inner = restoreInner(message);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message } }).catch((emitError) => console.error("Failed to emit Node worker message:", emitError));
		} catch (error) {
			console.error("Failed to parse Node worker message:", error);
			ctx.emit(workerErrorEvent, {
				kind: "parse",
				error: toError(error, "eventa: node worker message parse error")
			}, { raw: { message } }).catch((emitError) => console.error("Failed to emit Node worker parse error:", emitError));
		}
	});
	worker.on("error", (event) => {
		const error = toError(event, "eventa: invoke cancelled, node worker error");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "fatal",
			error
		}, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit Node worker error:", emitError));
	});
	worker.on("messageerror", (event) => {
		const error = toError(event, "eventa: invoke cancelled, node worker messageerror");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "messageerror",
			error,
			message: event
		}, { raw: { messageError: event } }).catch((emitError) => console.error("Failed to emit Node worker message error:", emitError));
	});
	return { context: ctx };
}
export { createContext, defineWorkerEventa, isWorkerEventa, workerErrorEvent };

//# sourceMappingURL=index.mjs.map