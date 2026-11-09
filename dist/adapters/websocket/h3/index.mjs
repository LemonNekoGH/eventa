import { _ as matchBy, m as defineEventa, o as createContext, p as and } from "../../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../../internal-BK_9UiZq.mjs";
// src/adapters/websocket/h3/global.ts
const wsConnectedEvent = defineEventa("eventa:adapters:websocket-global:connected");
const wsDisconnectedEvent = defineEventa("eventa:adapters:websocket-global:disconnected");
const wsErrorEvent = defineEventa("eventa:adapters:websocket-global:error");
function createGlobalContext(options) {
	const ctx = createContext(options?.context);
	const peers = /* @__PURE__ */ new Set();
	ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const data = JSON.stringify(inner);
		for (const peer of peers) peer.send(data);
	});
	return {
		websocketHandlers: {
			open(peer) {
				peers.add(peer);
				ctx.emit(wsConnectedEvent, { id: peer.id }, { raw: {} }).catch((emitError) => console.error("Failed to emit WebSocket open event:", emitError));
			},
			close(peer) {
				peers.delete(peer);
				ctx.emit(wsDisconnectedEvent, { id: peer.id }, { raw: {} }).catch((emitError) => console.error("Failed to emit WebSocket close event:", emitError));
			},
			error(_, error) {
				console.error("WebSocket error:", error);
				ctx.emit(wsErrorEvent, { error }, { raw: { error } }).catch((emitError) => console.error("Failed to emit WebSocket error:", emitError));
			},
			message(_, message) {
				try {
					const inner = restoreInner(JSON.parse(message.text()));
					ctx.emit(inner.eventa, inner.eventa.body, { raw: { message } }).catch((emitError) => console.error("Failed to emit WebSocket message:", emitError));
				} catch (error) {
					console.error("Failed to parse WebSocket message:", error);
					ctx.emit(wsErrorEvent, { error }, { raw: { message } }).catch((emitError) => console.error("Failed to emit WebSocket parse error:", emitError));
				}
			},
			drain() {},
			ping() {},
			pong() {}
		},
		context: ctx
	};
}
// src/adapters/websocket/h3/peer.ts
const wsConnectedEvent$1 = defineEventa("eventa:adapters:websocket-peer:connected");
const wsDisconnectedEvent$1 = defineEventa("eventa:adapters:websocket-peer:disconnected");
const wsErrorEvent$1 = defineEventa("eventa:adapters:websocket-peer:error");
function createPeerContext(peer, options) {
	const peerId = peer.id;
	const ctx = createContext(options?.context);
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (inner) peer.send(JSON.stringify(inner));
	});
	return {
		hooks: {
			message(incomingPeer, message) {
				if (incomingPeer.id !== peerId) return;
				try {
					const inner = restoreInner(JSON.parse(message.text()));
					ctx.emit(inner.eventa, inner.eventa.body, { raw: { message } }).catch((emitError) => console.error("Failed to emit WebSocket peer message:", emitError));
				} catch (error) {
					console.error("Failed to parse WebSocket message:", error);
					ctx.emit(wsErrorEvent$1, { error }, { raw: { message } }).catch((emitError) => console.error("Failed to emit WebSocket peer parse error:", emitError));
				}
			},
			close(incomingPeer, details) {
				if (incomingPeer.id !== peerId) return;
				const reasonText = details.reason ? ` (${details.reason})` : "";
				stopSending();
				ctx.abort(/* @__PURE__ */ new Error(`eventa: invoke cancelled, peer disconnected${reasonText}`));
				ctx.emit(wsDisconnectedEvent$1, { id: peerId }).catch((emitError) => console.error("Failed to emit WebSocket peer close event:", emitError));
			},
			error(incomingPeer, error) {
				if (incomingPeer.id !== peerId) return;
				stopSending();
				ctx.abort(error instanceof Error ? error : /* @__PURE__ */ new Error("eventa: invoke cancelled, peer error"));
				ctx.emit(wsErrorEvent$1, { error }).catch((emitError) => console.error("Failed to emit WebSocket peer error:", emitError));
			}
		},
		context: ctx
	};
}
function createPeerHooks(options) {
	let resolve;
	const untilLeastOneConnected = new Promise((r) => {
		resolve = r;
	});
	let message;
	let close;
	let error;
	return {
		hooks: {
			open: (peer) => {
				const peerContext = createPeerContext(peer, options);
				message = peerContext.hooks.message;
				close = peerContext.hooks.close;
				error = peerContext.hooks.error;
				resolve({
					peer,
					context: peerContext.context
				});
			},
			message: (peer, msg) => message?.(peer, msg),
			close: (peer, details) => close?.(peer, details),
			error: (peer, err) => error?.(peer, err)
		},
		untilLeastOneConnected
	};
}
export { createGlobalContext, createPeerContext, createPeerHooks, wsErrorEvent as global, wsConnectedEvent as globalWsConnectedEvent, wsDisconnectedEvent as globalWsDisconnectedEvent, wsConnectedEvent$1 as peerWsConnectedEvent, wsDisconnectedEvent$1 as peerWsDisconnectedEvent, wsErrorEvent$1 as peerWsErrorEvent };

//# sourceMappingURL=index.mjs.map