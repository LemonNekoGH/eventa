import isGlobMatch from "picomatch";
import { customAlphabet } from "nanoid/non-secure";
// src/eventa.ts
function nanoid() {
	return customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 16)();
}
let EventaType = /* @__PURE__ */ function(EventaType) {
	EventaType["Event"] = "event";
	EventaType["MatchExpression"] = "matchExpression";
	return EventaType;
}({});
let EventaFlowDirection = /* @__PURE__ */ function(EventaFlowDirection) {
	EventaFlowDirection["Inbound"] = "inbound";
	EventaFlowDirection["Outbound"] = "outbound";
	return EventaFlowDirection;
}({});
function defineInboundEventa(id) {
	return {
		...defineEventa(id),
		_flowDirection: "inbound"
	};
}
function defineOutboundEventa(id) {
	return {
		...defineEventa(id),
		_flowDirection: "outbound"
	};
}
function defineEventa(id, options) {
	if (!id) id = nanoid();
	const eventaObj = {
		id: options?.inheritFrom?.id || id,
		type: options?.inheritFrom?.type || "event"
	};
	const metadata = options?.inheritFrom?.metadata || options?.metadata;
	if (metadata) eventaObj.metadata = metadata;
	const invokeMetadata = options?.inheritFrom?.invokeMetadata || options?.invokeMetadata;
	if (invokeMetadata) eventaObj.invokeMetadata = invokeMetadata;
	return eventaObj;
}
function and(...matchExpression) {
	return {
		id: nanoid(),
		type: "matchExpression",
		matcher: (event) => {
			return matchExpression.every((m) => m.matcher ? m.matcher(event) : false);
		}
	};
}
function or(...matchExpression) {
	return {
		id: nanoid(),
		type: "matchExpression",
		matcher: (event) => {
			return matchExpression.some((m) => m.matcher ? m.matcher(event) : false);
		}
	};
}
function matchBy(matchExpressionPossibleValues, inverted) {
	const id = nanoid();
	let matcher = () => false;
	if (typeof matchExpressionPossibleValues === "string") matcher = (eventa) => {
		return isGlobMatch(matchExpressionPossibleValues)(eventa.id);
	};
	else if (typeof matchExpressionPossibleValues === "object") {
		if ("ids" in matchExpressionPossibleValues) matcher = (event) => {
			if (inverted) return !matchExpressionPossibleValues.ids.includes(event.id);
			return matchExpressionPossibleValues.ids.includes(event.id);
		};
		else if ("eventa" in matchExpressionPossibleValues) matcher = (event) => {
			if (inverted) return !matchExpressionPossibleValues.eventa.some((e) => e.id === event.id);
			return matchExpressionPossibleValues.eventa.some((e) => e.id === event.id);
		};
		else if ("types" in matchExpressionPossibleValues) matcher = (event) => {
			if (typeof event.type === "undefined") return false;
			if (inverted) return !matchExpressionPossibleValues.types.includes(event.type);
			return matchExpressionPossibleValues.types.includes(event.type);
		};
	} else if (matchExpressionPossibleValues instanceof RegExp) matcher = (event) => {
		if (inverted) return !matchExpressionPossibleValues.test(event.id);
		return matchExpressionPossibleValues.test(event.id);
	};
	else if (typeof matchExpressionPossibleValues === "function") matcher = matchExpressionPossibleValues;
	return {
		id,
		type: "matchExpression",
		matcher
	};
}
// src/internal.ts
const dispatchByEventa = /* @__PURE__ */ new WeakMap();
function createEventaInner(eventa, hopsRemaining) {
	return {
		deliveryId: nanoid(),
		hopsRemaining,
		eventa
	};
}
/**
* Associates forwarding state with an Eventa without changing the object shape
* observed by business listeners or serialized by unrelated consumers.
* `previousContext` exists only for one local Channel hop and is never sent
* across a transport.
*/
function setEventaInner(eventa, inner, previousContext) {
	dispatchByEventa.set(eventa, {
		inner,
		previousContext
	});
	return eventa;
}
/** Returns the forwarding state associated with one Context dispatch. */
function getEventaInner(eventa) {
	return dispatchByEventa.get(eventa)?.inner;
}
/** Returns the preceding Context for a local Channel hop, when one exists. */
function getPreviousContext(eventa) {
	return dispatchByEventa.get(eventa)?.previousContext;
}
/** Checks the complete transport-neutral Eventa delivery shape. */
function isEventaInner(value) {
	if (typeof value !== "object" || value === null) return false;
	const inner = value;
	return typeof inner.deliveryId === "string" && inner.deliveryId.length > 0 && Number.isSafeInteger(inner.hopsRemaining) && (inner.hopsRemaining ?? -1) >= 0 && typeof inner.eventa === "object" && inner.eventa !== null && typeof inner.eventa.id === "string";
}
// src/context.ts
const defaultRoutingOptions = {
	recentDeliveryLimit: 1e4,
	recentDeliveryTtl: 3e5,
	initialHops: 32
};
function resolveRoutingOptions(options) {
	const resolved = {
		...defaultRoutingOptions,
		...options
	};
	if (!Number.isSafeInteger(resolved.recentDeliveryLimit) || resolved.recentDeliveryLimit < 1) throw new RangeError("recentDeliveryLimit must be a positive safe integer.");
	if (!Number.isFinite(resolved.recentDeliveryTtl) || resolved.recentDeliveryTtl <= 0) throw new RangeError("recentDeliveryTtl must be a positive finite number.");
	if (!Number.isSafeInteger(resolved.initialHops) || resolved.initialHops < 0) throw new RangeError("initialHops must be a non-negative safe integer.");
	return resolved;
}
/**
* Creates an Eventa subscription and routing context.
*
* The context associates one delivery identity with each emitted Eventa before
* dispatch. Forwarding listeners preserve that identity when they emit into
* another Context. Recent IDs are bounded by both retention time and capacity;
* concurrent emit calls are intentionally unordered.
*/
function createContext(options = {}) {
	const listeners = /* @__PURE__ */ new Map();
	const onceListeners = /* @__PURE__ */ new Map();
	const matchExpressions = /* @__PURE__ */ new Map();
	const matchExpressionListeners = /* @__PURE__ */ new Map();
	const matchExpressionOnceListeners = /* @__PURE__ */ new Map();
	const lifetimeController = new AbortController();
	const recentDeliveries = /* @__PURE__ */ new Map();
	const routingOptions = resolveRoutingOptions(options.routing);
	function hasSeen(deliveryId) {
		const now = Date.now();
		for (const [knownDeliveryId, expiresAt] of recentDeliveries) {
			if (expiresAt > now) break;
			recentDeliveries.delete(knownDeliveryId);
		}
		const expiresAt = recentDeliveries.get(deliveryId);
		if (typeof expiresAt === "number" && expiresAt > now) return true;
		recentDeliveries.delete(deliveryId);
		recentDeliveries.set(deliveryId, now + routingOptions.recentDeliveryTtl);
		while (recentDeliveries.size > routingOptions.recentDeliveryLimit) {
			const oldestDeliveryId = recentDeliveries.keys().next().value;
			if (typeof oldestDeliveryId !== "string") break;
			recentDeliveries.delete(oldestDeliveryId);
		}
		return false;
	}
	function dispatch(event, localOptions) {
		const pending = [];
		function track(result) {
			if (typeof result === "object" && result !== null && "then" in result && typeof result.then === "function") pending.push(result);
		}
		function call(listener) {
			try {
				track(listener(event, localOptions));
			} catch (error) {
				pending.push(Promise.reject(error));
			}
		}
		for (const listener of listeners.get(event.id) || []) call(listener);
		for (const onceListener of onceListeners.get(event.id) || []) {
			call(onceListener);
			onceListeners.get(event.id)?.delete(onceListener);
		}
		for (const matchExpression of matchExpressions.values()) {
			if (!matchExpression.matcher || !matchExpression.matcher(event)) continue;
			for (const listener of matchExpressionListeners.get(matchExpression.id) || []) call(listener);
			for (const onceListener of matchExpressionOnceListeners.get(matchExpression.id) || []) {
				call(onceListener);
				matchExpressionOnceListeners.get(matchExpression.id)?.delete(onceListener);
			}
		}
		return Promise.all(pending).then(() => void 0);
	}
	function accept(inner, localOptions, previousContext) {
		if (hasSeen(inner.deliveryId)) return Promise.resolve();
		const pending = [];
		if (inner.hopsRemaining === 0) try {
			routingOptions.onDiagnostic?.({
				kind: "hops-exhausted",
				inner
			});
		} catch (error) {
			pending.push(Promise.reject(error));
		}
		else setEventaInner(inner.eventa, {
			...inner,
			hopsRemaining: inner.hopsRemaining - 1
		}, previousContext);
		pending.push(dispatch(inner.eventa, localOptions));
		return Promise.all(pending).then(() => void 0);
	}
	function emit(event, payload, localOptions) {
		const emittedEvent = {
			...event,
			body: payload
		};
		const existingInner = getEventaInner(event);
		const previousContext = getPreviousContext(event);
		return accept(existingInner ? {
			...existingInner,
			eventa: emittedEvent
		} : createEventaInner(emittedEvent, routingOptions.initialHops), localOptions, previousContext);
	}
	return {
		get listeners() {
			return listeners;
		},
		get onceListeners() {
			return onceListeners;
		},
		emit,
		on(eventOrMatchExpression, handler) {
			if (eventOrMatchExpression.type === "event") {
				const event = eventOrMatchExpression;
				if (!listeners.has(event.id)) listeners.set(event.id, /* @__PURE__ */ new Set());
				listeners.get(event.id)?.add(handler);
				return () => listeners.get(event.id)?.delete(handler);
			}
			if (eventOrMatchExpression.type === "matchExpression") {
				const matchExpression = eventOrMatchExpression;
				matchExpressions.set(matchExpression.id, matchExpression);
				if (!matchExpressionListeners.has(matchExpression.id)) matchExpressionListeners.set(matchExpression.id, /* @__PURE__ */ new Set());
				matchExpressionListeners.get(matchExpression.id)?.add(handler);
				return () => matchExpressionListeners.get(matchExpression.id)?.delete(handler);
			}
			return () => void 0;
		},
		once(eventOrMatchExpression, handler) {
			if (eventOrMatchExpression.type === "event") {
				const event = eventOrMatchExpression;
				if (!onceListeners.has(event.id)) onceListeners.set(event.id, /* @__PURE__ */ new Set());
				onceListeners.get(event.id)?.add(handler);
				return () => onceListeners.get(event.id)?.delete(handler);
			}
			if (eventOrMatchExpression.type === "matchExpression") {
				const matchExpression = eventOrMatchExpression;
				matchExpressions.set(matchExpression.id, matchExpression);
				if (!matchExpressionOnceListeners.has(matchExpression.id)) matchExpressionOnceListeners.set(matchExpression.id, /* @__PURE__ */ new Set());
				matchExpressionOnceListeners.get(matchExpression.id)?.add(handler);
				return () => matchExpressionOnceListeners.get(matchExpression.id)?.delete(handler);
			}
			return () => void 0;
		},
		off(eventOrMatchExpression, handler) {
			switch (eventOrMatchExpression.type) {
				case "event":
					if (handler !== void 0) {
						listeners.get(eventOrMatchExpression.id)?.delete(handler);
						onceListeners.get(eventOrMatchExpression.id)?.delete(handler);
						break;
					}
					listeners.delete(eventOrMatchExpression.id);
					onceListeners.delete(eventOrMatchExpression.id);
					break;
				case "matchExpression":
					if (handler !== void 0) {
						matchExpressionListeners.get(eventOrMatchExpression.id)?.delete(handler);
						matchExpressionOnceListeners.get(eventOrMatchExpression.id)?.delete(handler);
						break;
					}
					matchExpressionListeners.delete(eventOrMatchExpression.id);
					matchExpressionOnceListeners.delete(eventOrMatchExpression.id);
			}
		},
		signal: lifetimeController.signal,
		abort(reason) {
			if (!lifetimeController.signal.aborted) lifetimeController.abort(reason);
		}
	};
}
// src/invoke-shared.ts
let InvokeEventType = /* @__PURE__ */ function(InvokeEventType) {
	InvokeEventType[InvokeEventType["SendEvent"] = 0] = "SendEvent";
	InvokeEventType[InvokeEventType["SendEventError"] = 1] = "SendEventError";
	InvokeEventType[InvokeEventType["SendEventStreamEnd"] = 2] = "SendEventStreamEnd";
	InvokeEventType[InvokeEventType["SendEventAbort"] = 3] = "SendEventAbort";
	InvokeEventType[InvokeEventType["ReceiveEvent"] = 4] = "ReceiveEvent";
	InvokeEventType[InvokeEventType["ReceiveEventError"] = 5] = "ReceiveEventError";
	InvokeEventType[InvokeEventType["ReceiveEventStreamEnd"] = 6] = "ReceiveEventStreamEnd";
	return InvokeEventType;
}({});
function defineInvokeEventa(tag, options) {
	if (!tag) tag = nanoid();
	return {
		sendEvent: {
			...defineEventa(`${tag}-send`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 0
		},
		sendEventError: {
			...defineEventa(`${tag}-send-error`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 1
		},
		sendEventStreamEnd: {
			...defineEventa(`${tag}-send-stream-end`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 2
		},
		sendEventAbort: {
			...defineEventa(`${tag}-send-abort`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 3
		},
		receiveEvent: {
			...defineEventa(`${tag}-receive`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 4
		},
		receiveEventError: {
			...defineEventa(`${tag}-receive-error`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 5
		},
		receiveEventStreamEnd: {
			...defineEventa(`${tag}-receive-stream-end`, {
				metadata: options?.metadata,
				invokeMetadata: options?.invokeMetadata
			}),
			invokeType: 6
		}
	};
}
function isInvokeEventa(event) {
	if (typeof event !== "object") return false;
	if ("invokeType" in event) return true;
	return false;
}
function isSendEvent(event) {
	if (!isInvokeEventa(event)) return false;
	return event.invokeType === 0 || event.invokeType === 1 || event.invokeType === 2 || event.invokeType === 3;
}
function isReceiveEvent(event) {
	if (!isInvokeEventa(event)) return false;
	return event.invokeType === 4 || event.invokeType === 5 || event.invokeType === 6;
}
export { matchBy as _, isSendEvent as a, getPreviousContext as c, EventaFlowDirection as d, EventaType as f, defineOutboundEventa as g, defineInboundEventa as h, isReceiveEvent as i, isEventaInner as l, defineEventa as m, defineInvokeEventa as n, createContext as o, and as p, isInvokeEventa as r, getEventaInner as s, InvokeEventType as t, setEventaInner as u, nanoid as v, or as y };

//# sourceMappingURL=invoke-shared-BgaCcbG9.mjs.map