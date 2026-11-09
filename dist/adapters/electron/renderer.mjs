import { _ as matchBy, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
import { t as errorEvent } from "../../shared-BVdNSWgn.mjs";
// src/adapters/electron/renderer.ts
function createContext(ipcRenderer, options) {
	const ctx = createContext$1(options?.context);
	const { messageEventName = "eventa-message", errorEventName = "eventa-error", extraListeners = {} } = options || {};
	const cleanupRemoval = [];
	function listen(channel, listener) {
		const remove = ipcRenderer.on(channel, listener);
		cleanupRemoval.push({ remove: typeof remove === "function" ? remove : () => ipcRenderer.removeListener(channel, listener) });
	}
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		if (messageEventName === false) return;
		try {
			ipcRenderer.send(messageEventName, inner);
		} catch (error) {
			if (!(error instanceof Error) || error.message !== "Object has been destroyed") throw error;
		}
	});
	function handleIncomingMessage(ipcRendererEvent, event) {
		try {
			const inner = restoreInner(event);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: {
				ipcRendererEvent,
				event
			} }).catch((emitError) => console.error("Failed to emit IpcRenderer message:", emitError));
		} catch (error) {
			console.error("Failed to parse IpcRenderer message:", error);
			ctx.emit(errorEvent, { error }, { raw: {
				ipcRendererEvent,
				event
			} }).catch((emitError) => console.error("Failed to emit IpcRenderer parse error:", emitError));
		}
	}
	if (messageEventName) listen(messageEventName, handleIncomingMessage);
	if (errorEventName) {
		const handleErrorMessage = (ipcRendererEvent, error) => {
			ctx.emit(errorEvent, { error }, { raw: {
				ipcRendererEvent,
				event: error
			} }).catch((emitError) => console.error("Failed to emit IpcRenderer error:", emitError));
		};
		listen(errorEventName, handleErrorMessage);
	}
	for (const [eventName, listener] of Object.entries(extraListeners)) listen(eventName, listener);
	return {
		context: ctx,
		dispose: (reason) => {
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, electron renderer ipc disposed"));
			cleanupRemoval.forEach((removal) => removal.remove());
		}
	};
}
export { createContext };

//# sourceMappingURL=renderer.mjs.map