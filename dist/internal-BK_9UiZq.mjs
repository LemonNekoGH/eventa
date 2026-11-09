import { g as defineOutboundEventa, h as defineInboundEventa, i as isReceiveEvent, l as isEventaInner, s as getEventaInner, u as setEventaInner } from "./invoke-shared-BgaCcbG9.mjs";
// src/adapters/internal.ts
function serializeInvokeErrorEventa(eventa) {
	if (!isReceiveEvent(eventa) || eventa.invokeType !== 5) return eventa;
	const body = eventa.body;
	const err = body?.content?.error;
	if (!(err instanceof Error)) return eventa;
	const extras = {};
	for (const [key, value] of Object.entries(err)) extras[key] = value;
	if (Object.keys(extras).length === 0) return eventa;
	return {
		...eventa,
		body: {
			...body,
			content: {
				...body?.content,
				__eventaErrorExtras: extras
			}
		}
	};
}
function restoreInvokeErrorEventa(eventa) {
	if (!isReceiveEvent(eventa) || eventa.invokeType !== 5) return eventa;
	const body = eventa.body;
	const err = body?.content?.error;
	const extras = body?.content?.__eventaErrorExtras;
	if (err instanceof Error && extras && typeof extras === "object") Object.assign(err, extras);
	return eventa;
}
const legacyInitialHops = 32;
function isLegacyAdapterValue(value) {
	if (typeof value !== "object" || value === null) return false;
	const legacy = value;
	return typeof legacy.id === "string" && legacy.id.length > 0 && typeof legacy.type === "string" && typeof legacy.payload === "object" && legacy.payload !== null && typeof legacy.payload.id === "string" && legacy.payload.id === legacy.type;
}
/** Adds the beta.13 fields without changing the EventaInner fields. */
function createAdapterInner(inner) {
	return {
		...inner,
		id: inner.deliveryId,
		type: inner.eventa.id,
		payload: inner.eventa,
		timestamp: Date.now()
	};
}
/**
* Creates the outbound transport value for an Eventa dispatched by Context.
* Returns `undefined` after the delivery has exhausted its hop budget.
*/
function createOutboundInner(eventa) {
	const inner = getEventaInner(eventa);
	if (!inner) return;
	const serializedEventa = serializeInvokeErrorEventa(inner.eventa);
	return createAdapterInner({
		...inner,
		eventa: {
			...serializedEventa,
			...defineOutboundEventa(serializedEventa.id)
		}
	});
}
/**
* Validates a transport value and restores its Eventa as inbound. The hidden
* association lets the following `ctx.emit(...)` preserve the delivery ID.
*/
function restoreInner(value) {
	let inner;
	if (isEventaInner(value)) inner = value;
	else if (isLegacyAdapterValue(value)) inner = {
		deliveryId: value.id,
		hopsRemaining: legacyInitialHops,
		eventa: value.payload
	};
	else throw new TypeError("Invalid EventaInner.");
	const restoredEventa = restoreInvokeErrorEventa(inner.eventa);
	const restored = {
		...inner,
		eventa: {
			...restoredEventa,
			...defineInboundEventa(restoredEventa.id)
		}
	};
	setEventaInner(restored.eventa, restored);
	return restored;
}
export { createOutboundInner as n, restoreInner as r, createAdapterInner as t };

//# sourceMappingURL=internal-BK_9UiZq.mjs.map