import { _ as matchBy, o as createContext$1, p as and } from "../../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner } from "../../../internal-BK_9UiZq.mjs";
import { a as workerErrorEvent, n as restoreInner, t as createWorkerInnerEventa } from "../../../internal-DwjkmlkQ.mjs";
import { parentPort } from "node:worker_threads";
// src/adapters/worker-threads/worker/index.ts
function createContext(options) {
	const messagePort = options?.messagePort ?? parentPort;
	if (!messagePort) throw new Error("Node worker context requires a MessagePort (parentPort is null).");
	const ctx = createContext$1(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event, emitOptions) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const outgoing = createWorkerInnerEventa(inner, emitOptions);
		if (outgoing.transfer != null) {
			messagePort.postMessage(outgoing.inner, outgoing.transfer);
			return;
		}
		messagePort.postMessage(outgoing.inner);
	});
	messagePort.on("message", (message) => {
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
	messagePort.on("error", (event) => {
		const error = toError(event, "eventa: invoke cancelled, node worker port error");
		stopSending();
		ctx.abort(error);
		ctx.emit(workerErrorEvent, {
			kind: "fatal",
			error
		}, { raw: { error: event } }).catch((emitError) => console.error("Failed to emit Node worker error:", emitError));
	});
	messagePort.on("messageerror", (event) => {
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
export { createContext, workerErrorEvent };

//# sourceMappingURL=index.mjs.map