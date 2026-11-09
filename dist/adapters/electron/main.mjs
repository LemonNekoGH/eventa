import { _ as matchBy, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
import { t as errorEvent } from "../../shared-BVdNSWgn.mjs";
// src/adapters/electron/main.ts
function withRemoval(ipcMain, type, listener) {
	ipcMain.on(type, listener);
	return { remove: () => ipcMain.off(type, listener) };
}
function sendToWebContents(target, channel, inner) {
	if ("webContents" in target) {
		if (!target.isDestroyed() && !target.webContents.isDestroyed()) target.webContents.send(channel, inner);
		return;
	}
	if (!target.isDestroyed()) target.send(channel, inner);
}
/**
* Binds a context to Electron IPC. A supplied window selects the send target.
* Enable `onlySameWindow` to restrict incoming IPC and tie disposal to window closure.
* Otherwise, the caller must dispose the adapter when its owner stops.
*/
function createContext(ipcMain, window, options) {
	const { messageEventName = "eventa-message", errorEventName = "eventa-error", extraListeners = {}, onlySameWindow = false, allowSender, targets } = options || {};
	if (onlySameWindow && (!window || window.isDestroyed() || window.webContents.isDestroyed())) throw new TypeError("eventa: onlySameWindow requires a live BrowserWindow");
	const boundWindow = onlySameWindow ? window : void 0;
	const ctx = createContext$1(options?.context);
	const cleanupRemoval = [];
	let disposed = false;
	function listen(type, listener) {
		cleanupRemoval.push(withRemoval(ipcMain, type, (event, ...args) => {
			if (disposed || boundWindow && event.sender !== boundWindow.webContents) return;
			if (allowSender && !allowSender(event)) return;
			return listener(event, ...args);
		}));
	}
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event, callOptions) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		if (messageEventName === false) return;
		try {
			if (window != null) {
				if (window.isDestroyed()) return;
				if (onlySameWindow && callOptions?.raw?.ipcMainEvent != null && window.webContents.id !== callOptions.raw.ipcMainEvent.sender.id) return;
				window.webContents.send(messageEventName, inner);
				return;
			}
			const explicitTarget = callOptions?.raw?.targetWebContents;
			if (explicitTarget != null) {
				if (Symbol.iterator in Object(explicitTarget)) for (const target of explicitTarget) sendToWebContents(target, messageEventName, inner);
				else sendToWebContents(explicitTarget, messageEventName, inner);
				return;
			}
			const sender = callOptions?.raw?.ipcMainEvent?.sender;
			if (sender != null) {
				if (!sender.isDestroyed()) sender.send(messageEventName, inner);
				return;
			}
			if (targets != null) for (const target of targets()) sendToWebContents(target, messageEventName, inner);
		} catch (error) {
			if (!(error instanceof Error) || error.message !== "Object has been destroyed") throw error;
		}
	});
	if (messageEventName) listen(messageEventName, (ipcMainEvent, event) => {
		try {
			const inner = restoreInner(event);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: {
				ipcMainEvent,
				event
			} }).catch((emitError) => console.error("Failed to emit IpcMain message:", emitError));
		} catch (error) {
			console.error("Failed to parse IpcMain message:", error);
			ctx.emit(errorEvent, { error }, { raw: {
				ipcMainEvent,
				event
			} }).catch((emitError) => console.error("Failed to emit IpcMain parse error:", emitError));
		}
	});
	if (errorEventName) listen(errorEventName, (ipcMainEvent, error) => {
		ctx.emit(errorEvent, { error }, { raw: {
			ipcMainEvent,
			event: error
		} }).catch((emitError) => console.error("Failed to emit IpcMain error:", emitError));
	});
	for (const [eventName, listener] of Object.entries(extraListeners)) listen(eventName, listener);
	function dispose(reason) {
		if (disposed) return;
		disposed = true;
		stopSending();
		ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, electron main ipc disposed"));
		cleanupRemoval.forEach((removal) => removal.remove());
		if (boundWindow) boundWindow.off("closed", onWindowClosed);
	}
	function onWindowClosed() {
		dispose(/* @__PURE__ */ new Error("eventa: invoke cancelled, electron window closed"));
	}
	if (boundWindow) boundWindow.once("closed", onWindowClosed);
	return {
		context: ctx,
		dispose
	};
}
export { createContext };

//# sourceMappingURL=main.mjs.map