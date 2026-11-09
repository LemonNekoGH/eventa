import { _ as matchBy, o as createContext$1, p as and } from "../../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner } from "../../../internal-BK_9UiZq.mjs";
import { a as workerErrorEvent, n as restoreInner, t as createWorkerInnerEventa } from "../../../internal-DwjkmlkQ.mjs";
// src/adapters/webworkers/worker/index.ts
function createContext(options) {
	const messagePort = options?.messagePort ?? self;
	const ctx = createContext$1(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event, emitOptions) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const outgoing = createWorkerInnerEventa(inner, emitOptions);
		if (outgoing.transfer != null) {
			messagePort.postMessage(outgoing.inner, { transfer: outgoing.transfer });
			return;
		}
		messagePort.postMessage(outgoing.inner);
	});
	messagePort.onmessage = (event) => {
		try {
			const inner = restoreInner(event.data);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { event } }).catch((emitError) => console.error("Failed to emit WebWorker message:", emitError));
		} catch (error) {
			console.error("Failed to parse WebWorker message:", error);
			ctx.emit(workerErrorEvent, {
				kind: "parse",
				error: toError(error, "eventa: webworker message parse error")
			}, { raw: { event } }).catch((emitError) => console.error("Failed to emit WebWorker parse error:", emitError));
		}
	};
	messagePort.onerror = (event) => {
		const error = toError(event, "eventa: invoke cancelled, webworker self error");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "fatal",
			error
		}, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit WebWorker error:", emitError));
	};
	return { context: ctx };
}
export { createContext, workerErrorEvent };

//# sourceMappingURL=index.mjs.map