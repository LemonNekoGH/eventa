import { _ as matchBy, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner } from "../../internal-BK_9UiZq.mjs";
import { a as workerErrorEvent, i as isWorkerEventa, n as restoreInner, r as defineWorkerEventa, t as createWorkerInnerEventa } from "../../internal-DwjkmlkQ.mjs";
// src/adapters/webworkers/index.ts
function createContext(worker, options) {
	const ctx = createContext$1(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event, emitOptions) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const outgoing = createWorkerInnerEventa(inner, emitOptions);
		if (outgoing.transfer != null) {
			worker.postMessage(outgoing.inner, { transfer: outgoing.transfer });
			return;
		}
		worker.postMessage(outgoing.inner);
	});
	worker.onmessage = (event) => {
		try {
			const inner = restoreInner(event.data);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit WebWorker message:", emitError));
		} catch (error) {
			console.error("Failed to parse WebWorker message:", error);
			ctx.emit(workerErrorEvent, {
				kind: "parse",
				error: toError(error, "eventa: webworker message parse error")
			}, { raw: { message: event } }).catch((emitError) => console.error("Failed to emit WebWorker parse error:", emitError));
		}
	};
	worker.onerror = (event) => {
		const error = toError(event, "eventa: invoke cancelled, webworker error");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "fatal",
			error
		}, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit WebWorker error:", emitError));
	};
	worker.onmessageerror = (event) => {
		const error = toError(event, "eventa: invoke cancelled, webworker messageerror");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "messageerror",
			error,
			message: event
		}, { raw: { messageError: event } }).catch((emitError) => console.error("Failed to emit WebWorker message error:", emitError));
	};
	return { context: ctx };
}
export { createContext, defineWorkerEventa, isWorkerEventa, workerErrorEvent };

//# sourceMappingURL=index.mjs.map