import { r as restoreInner$1, t as createAdapterInner } from "./internal-BK_9UiZq.mjs";
import { m as defineEventa } from "./invoke-shared-BgaCcbG9.mjs";
import { a as isExtendableInvokeResponseLike } from "./invoke-C68JwPdT.mjs";
// src/adapters/webworkers/shared.ts
function defineWorkerEventa(id) {
	return {
		...defineEventa(id),
		_workerTransfer: true
	};
}
function isWorkerEventa(event) {
	return typeof event === "object" && "_workerTransfer" in event && typeof event._workerTransfer === "boolean" && event._workerTransfer === true;
}
/**
* Emitted by the worker adapters whenever a worker fails: an inbound message
* fails to parse (`kind: 'parse'`, non-fatal), the worker hits a fatal
* `error` (`kind: 'fatal'`), or a message can't be deserialized
* (`kind: 'messageerror'`). Has a stable id so it can be subscribed to across
* module boundaries.
*/
const workerErrorEvent = defineEventa("eventa:worker:error");
function normalizeOnListenerParameters(event, options) {
	let eventPayload = event.body;
	let transfer;
	if (isExtendableInvokeResponseLike(event)) {
		if (event.body.content.invokeResponse?.transfer != null) transfer = event.body.content.invokeResponse.transfer;
		eventPayload = {
			...event.body,
			content: event.body.content.response
		};
	} else if (isWorkerEventa(event)) {
		transfer = event.body?.transfer;
		eventPayload = event.body?.message;
	}
	if (typeof options !== "undefined" && options != null && typeof options === "object" && "transfer" in options) {
		if (Array.isArray(options.transfer)) transfer = options.transfer;
	}
	return {
		body: eventPayload,
		transfer
	};
}
// src/adapters/webworkers/internal.ts
/**
* Creates the worker wire value without mutating the context-owned inner value.
* Transfer metadata is removed from the Eventa body because the worker API
* carries the transfer list out of band in `postMessage` options.
*/
function createWorkerInnerEventa(inner, options) {
	const clonedBody = typeof inner.eventa.body === "object" && inner.eventa.body !== null ? { ...inner.eventa.body } : inner.eventa.body;
	const eventa = {
		...inner.eventa,
		body: clonedBody
	};
	const { body, transfer } = normalizeOnListenerParameters(eventa, options);
	return {
		inner: createAdapterInner({
			...inner,
			eventa: {
				...eventa,
				body
			}
		}),
		transfer
	};
}
/** Restores the public worker-event body shape after transport deserialization. */
function restoreInner(value) {
	const inner = restoreInner$1(value);
	if (!isWorkerEventa(inner.eventa)) return inner;
	return restoreInner$1({
		...inner,
		eventa: {
			...inner.eventa,
			body: { message: inner.eventa.body }
		}
	});
}
export { workerErrorEvent as a, isWorkerEventa as i, restoreInner as n, defineWorkerEventa as r, createWorkerInnerEventa as t };

//# sourceMappingURL=internal-DwjkmlkQ.mjs.map