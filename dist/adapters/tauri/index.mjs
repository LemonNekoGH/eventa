import { _ as matchBy, h as defineInboundEventa, m as defineEventa, o as createContext$1, p as and, r as isInvokeEventa } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";
// src/adapters/tauri/shared.ts
/**
* Emitted when a Tauri message cannot be parsed or an invoke cannot be sent.
* A malformed message does not abort the context because the underlying Tauri
* event transport is still usable.
*/
const errorEvent = defineEventa("eventa:tauri:error");
// src/adapters/tauri/index.ts
async function createContext(options) {
	const ctx = createContext$1(options.context);
	const messageEventName = options.messageEventName ?? "eventa-message";
	let disposePromise;
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (!inner) return;
		const sendOperation = emitTo(options.target, messageEventName, inner);
		if (!isInvokeEventa(inner.eventa)) return sendOperation;
		return sendOperation.catch((cause) => {
			const error = toError(cause, "eventa: Tauri invoke send failed");
			stopSending();
			ctx.abort(error);
			ctx.emit(defineInboundEventa(errorEvent.id), {
				kind: "fatal",
				error
			}).catch((emitError) => console.error("Failed to emit Tauri send error:", emitError));
		});
	});
	const listenTarget = options.listenTarget ?? getCurrentWebview().label;
	const unlisten = await listen(messageEventName, (event) => {
		try {
			const inner = restoreInner(event.payload);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { event } }).catch((emitError) => console.error("Failed to emit Tauri message:", emitError));
		} catch (error) {
			console.error("Failed to parse Tauri message:", error);
			ctx.emit(defineInboundEventa(errorEvent.id), {
				kind: "parse",
				error: toError(error, "eventa: Tauri message parse error")
			}, { raw: { event } }).catch((emitError) => console.error("Failed to emit Tauri parse error:", emitError));
		}
	}, { target: listenTarget });
	return {
		context: ctx,
		dispose: (reason) => {
			if (disposePromise) return disposePromise;
			stopSending();
			ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, Tauri adapter disposed"));
			disposePromise = Promise.resolve().then(() => unlisten());
			return disposePromise;
		}
	};
}
export { createContext, errorEvent };

//# sourceMappingURL=index.mjs.map