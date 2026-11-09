import { i as isReceiveEvent, m as defineEventa, v as nanoid } from "./invoke-shared-BgaCcbG9.mjs";
// src/utils.ts
function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
* Checks if a value is an AsyncIterable.
*
* @param value
* @returns True if the value is an AsyncIterable.
*/
function isAsyncIterable(value) {
	return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}
/**
* Checks if an object is a ReadableStream.
*
* @link https://github.com/cloudflare/workerd/blob/88e8696ce7a5f8969a7e02a2dcfb6504c17c9e8d/src/cloudflare/internal/streaming-forms.ts#L3
* @param obj
* @returns True if the object looks like a ReadableStream.
*/
function isReadableStream(obj) {
	return !!(obj && typeof obj === "object" && "getReader" in obj && typeof obj.getReader === "function");
}
function createAbortError(reason) {
	if (reason instanceof Error && reason.name === "AbortError") return reason;
	if (typeof DOMException !== "undefined") try {
		return new DOMException(reason ? String(reason) : "Aborted", "AbortError");
	} catch {}
	const error = reason instanceof Error ? reason : new Error(reason ? String(reason) : "Aborted");
	error.name = "AbortError";
	return error;
}
function isAbortError(error) {
	return error instanceof Error && error.name === "AbortError";
}
function createUntilTriggeredOnce(fn) {
	let resolve;
	const promise = new Promise((res) => {
		resolve = res;
	});
	const handler = async (...args) => {
		const res = await fn(...args);
		resolve(res);
		return res;
	};
	return {
		onceTriggered: promise,
		wrapper: handler
	};
}
function createUntilTriggered(fn) {
	let resolve;
	const promise = new Promise((res) => {
		resolve = res;
	});
	const handler = (...args) => {
		resolve();
		return fn(...args);
	};
	return {
		promise,
		handler
	};
}
function createUntil(options) {
	let resolve;
	const promise = new Promise((res) => {
		resolve = res;
	});
	if (options?.intervalHandler) setInterval(() => {
		options?.intervalHandler?.().then((shouldResolve) => {
			if (shouldResolve) resolve(void 0);
		});
	}, options.interval ?? 50);
	return {
		promise,
		handler: resolve
	};
}
// src/invoke-state.ts
/**
* Owns request reconstruction and cancellation correlation for one handler.
*
* Cancellation is allowed to arrive before request data. Bounded cancellation
* state keeps that reason until the first request frame materializes exactly one
* handler invocation; later frames for the cancelled invocation are ignored.
*/
var InvokeState = class {
	contextSignal;
	maxCancelStates;
	abortControllers = /* @__PURE__ */ new Map();
	invokeCancelStates = /* @__PURE__ */ new Map();
	streamControllers = /* @__PURE__ */ new Map();
	/**
	* Propagates the owning context lifetime into active invocation state.
	*
	* Triggering workflow:
	*
	* {@link AbortController.abort}
	*   -> {@link AbortSignal.addEventListener}
	*     -> `abort`
	*       -> {@link InvokeState.onContextAbort}
	*
	* Upstream:
	* - {@link AbortController.abort}
	*
	* Downstream:
	* - {@link AbortController.abort}
	* - {@link ReadableStreamDefaultController.error}
	*/
	onContextAbort = () => {
		for (const controller of this.abortControllers.values()) this.scheduleAbort(controller, this.contextSignal.reason);
		for (const controller of this.streamControllers.values()) controller.error(createAbortError(this.contextSignal.reason));
		this.streamControllers.clear();
	};
	constructor(contextSignal, maxCancelStates = 1e4) {
		this.contextSignal = contextSignal;
		this.maxCancelStates = maxCancelStates;
		if (contextSignal.aborted) {
			this.onContextAbort();
			return;
		}
		contextSignal.addEventListener("abort", this.onContextAbort, { once: true });
	}
	shouldIgnoreFrame(invokeId) {
		if (this.contextSignal.aborted) return true;
		return this.invokeCancelStates.get(invokeId)?.materialized === true;
	}
	materialize(invokeId) {
		const controller = new AbortController();
		this.abortControllers.set(invokeId, controller);
		if (this.contextSignal.aborted) this.scheduleAbort(controller, this.contextSignal.reason);
		const cancellation = this.invokeCancelStates.get(invokeId);
		if (!cancellation) return controller;
		const reason = cancellation.reason;
		cancellation.materialized = true;
		cancellation.reason = void 0;
		this.scheduleAbort(controller, reason);
		return controller;
	}
	openRequestStream(invokeId) {
		const existing = this.streamControllers.get(invokeId);
		if (existing) return { controller: existing };
		let controller;
		const stream = new ReadableStream({ start(value) {
			controller = value;
		} });
		this.streamControllers.set(invokeId, controller);
		return {
			controller,
			stream
		};
	}
	pushRequestChunk(invokeId, controller, value) {
		if (this.errorCancelledStream(invokeId, controller)) return false;
		controller.enqueue(value);
		return true;
	}
	endRequestStream(invokeId, controller) {
		if (this.errorCancelledStream(invokeId, controller)) return false;
		controller.close();
		this.streamControllers.delete(invokeId);
		return true;
	}
	errorRequestStream(invokeId, controller, error) {
		controller.error(error);
		this.streamControllers.delete(invokeId);
	}
	rememberAbort(invokeId, reason) {
		const abortController = this.abortControllers.get(invokeId);
		const streamController = this.streamControllers.get(invokeId);
		const cancellation = this.invokeCancelStates.get(invokeId);
		if (cancellation?.materialized) return;
		if (cancellation) cancellation.reason = reason;
		else {
			const isActive = abortController !== void 0 || streamController !== void 0;
			this.invokeCancelStates.set(invokeId, {
				materialized: isActive,
				reason: isActive ? void 0 : reason
			});
		}
		while (this.invokeCancelStates.size > this.maxCancelStates) {
			const oldest = this.invokeCancelStates.keys().next();
			if (oldest.done) break;
			this.invokeCancelStates.delete(oldest.value);
		}
		if (abortController) this.scheduleAbort(abortController, reason);
		if (!streamController) return;
		streamController.error(createAbortError(reason));
		this.streamControllers.delete(invokeId);
	}
	complete(invokeId) {
		this.abortControllers.delete(invokeId);
	}
	dispose() {
		this.contextSignal.removeEventListener("abort", this.onContextAbort);
	}
	errorCancelledStream(invokeId, controller) {
		if (this.contextSignal.aborted) {
			controller.error(createAbortError(this.contextSignal.reason));
			this.streamControllers.delete(invokeId);
			return true;
		}
		const cancellation = this.invokeCancelStates.get(invokeId);
		if (!cancellation) return false;
		controller.error(createAbortError(cancellation.reason));
		this.streamControllers.delete(invokeId);
		return true;
	}
	scheduleAbort(controller, reason) {
		if (typeof queueMicrotask === "function") {
			queueMicrotask(() => controller.abort(reason));
			return;
		}
		Promise.resolve().then(() => controller.abort(reason));
	}
};
// src/invoke.ts
function isExtendableInvokeResponseLike(value) {
	if (!isReceiveEvent(value)) return false;
	return typeof value.body?.content === "object" && value.body?.content != null && "response" in value.body.content && (!("invokeResponse" in value.body.content) || "invokeResponse" in value.body.content && (typeof value.body.content.invokeResponse === "object" || typeof value.body.content.invokeResponse === "undefined"));
}
/**
* Create a unary invoke function (client side).
*
* It supports unary or streaming requests, but returns a single response.
* Use `defineStreamInvoke` when you expect a stream of responses.
* Streaming request chunks are ordered within this invocation even though the
* underlying context does not order independent emits.
*
* If you want stream input, set `Req` to `ReadableStream<T>` or `AsyncIterable<T>`
* (or a union type like `T | ReadableStream<T>` for optional streaming).
*
* @example
* ```ts
* // 1) Define eventa once (shared by client/server)
* const events = defineInvokeEventa<{ id: string }, { name: string }>()
*
* // 2) Client: define invoke function
* const invoke = defineInvoke(clientCtx, events)
*
* // 3) Call
* const res = await invoke({ name: 'alice' })
* ```
*
* @example
* ```ts
* // Stream request -> unary response
* const events = defineInvokeEventa<number, ReadableStream<number>>()
*
* defineInvokeHandler(serverCtx, events, async (payload) => {
*   let sum = 0
*   for await (const value of payload) {
*     sum += value
*   }
*
*   return sum
* })
*
* const invoke = defineInvoke(clientCtx, events)
* const input = new ReadableStream<number>({
*   start(controller) {
*     controller.enqueue(1)
*     controller.enqueue(2)
*     controller.close()
*   },
* })
*
* const total = await invoke(input)
* ```
*
* @param ctx Event context on the caller/client side.
* @param event Invoke event definition created by `defineInvokeEventa`.
*/
function defineInvoke(ctx, event) {
	function getContext() {
		if (typeof ctx === "function") return ctx();
		return ctx;
	}
	function createInvokePromise(resolvedCtx, req, options) {
		return new Promise((resolve, reject) => {
			const ctx = resolvedCtx;
			const invokeId = nanoid();
			const invokeReceiveEvent = defineEventa(`${event.receiveEvent.id}-${invokeId}`);
			delete invokeReceiveEvent.metadata;
			const invokeReceiveEventError = defineEventa(`${event.receiveEventError.id}-${invokeId}`);
			delete invokeReceiveEventError.metadata;
			const { signal, ...emitOptions } = options ?? {};
			const requestEmitOptions = emitOptions;
			let finished = false;
			const onAbort = () => {
				ctx.emit(event.sendEventAbort, {
					invokeId,
					content: signal?.reason
				}, requestEmitOptions).catch(() => void 0);
				finishReject(createAbortError(signal?.reason));
			};
			const ctxSignal = ctx.signal;
			const onCtxAbort = () => {
				finishReject(ctxSignal?.reason);
			};
			const cleanup = () => {
				ctx.off(invokeReceiveEvent);
				ctx.off(invokeReceiveEventError);
				if (ctxSignal) ctxSignal.removeEventListener("abort", onCtxAbort);
				if (signal) signal.removeEventListener("abort", onAbort);
			};
			const finishReject = (error) => {
				if (finished) return;
				finished = true;
				reject(error);
				cleanup();
			};
			const finishResolve = (value) => {
				if (finished) return;
				finished = true;
				resolve(value);
				cleanup();
			};
			ctx.on(invokeReceiveEvent, (payload) => {
				if (!payload.body) return;
				if (payload.body.invokeId !== invokeId) return;
				const { content } = payload.body;
				finishResolve(content);
			});
			ctx.on(invokeReceiveEventError, (payload) => {
				if (!payload.body) return;
				if (payload.body.invokeId !== invokeId) return;
				const { error } = payload.body.content;
				finishReject(error);
			});
			if (ctxSignal) {
				if (ctxSignal.aborted) {
					onCtxAbort();
					return;
				}
				ctxSignal.addEventListener("abort", onCtxAbort, { once: true });
			}
			if (signal) {
				if (signal.aborted) {
					onAbort();
					return;
				}
				signal.addEventListener("abort", onAbort, { once: true });
			}
			if (!isReadableStream(req) && !isAsyncIterable(req)) ctx.emit(event.sendEvent, {
				invokeId,
				content: req
			}, requestEmitOptions).catch(finishReject);
			else {
				const sendChunk = (chunk) => {
					if (finished) return Promise.resolve();
					return ctx.emit(event.sendEvent, {
						invokeId,
						content: chunk,
						isReqStream: true
					}, requestEmitOptions);
				};
				const sendEnd = () => {
					if (finished) return Promise.resolve();
					return ctx.emit(event.sendEventStreamEnd, {
						invokeId,
						content: void 0
					}, requestEmitOptions);
				};
				const pump = async () => {
					let sending = false;
					try {
						for await (const chunk of req) {
							if (signal?.aborted) return;
							sending = true;
							await sendChunk(chunk);
							sending = false;
							if (finished) return;
						}
						if (finished) return;
						sending = true;
						await sendEnd();
					} catch (error) {
						if (sending) ctx.emit(event.sendEventAbort, {
							invokeId,
							content: error
						}, requestEmitOptions).catch(() => void 0);
						else {
							finishReject(error);
							try {
								await ctx.emit(event.sendEventError, {
									invokeId,
									content: error
								}, requestEmitOptions);
							} catch (publishError) {
								ctx.emit(event.sendEventAbort, {
									invokeId,
									content: publishError
								}, requestEmitOptions).catch(() => void 0);
							}
						}
						if (sending) finishReject(error);
					}
				};
				pump();
			}
		});
	}
	function _invoke(req, options) {
		const resolvedCtx = getContext();
		if (resolvedCtx instanceof Promise) return resolvedCtx.then((ctx) => createInvokePromise(ctx, req, options));
		return createInvokePromise(resolvedCtx, req, options);
	}
	return _invoke;
}
/**
* Create a map of invoke functions from a map of invoke events (client side).
*
* @example
* ```ts
* const events = {
*   double: defineInvokeEventa<number, number>(),
*   greet: defineInvokeEventa<string, { name: string }>(),
* }
*
* const invokes = defineInvokes(ctx, events)
* const result = await invokes.double(2)
* ```
*
* @param ctx Event context on the caller/client side.
* @param events Map of invoke events created by `defineInvokeEventa`.
*/
function defineInvokes(ctx, events) {
	return Object.keys(events).reduce((invokes, key) => {
		invokes[key] = defineInvoke(ctx, events[key]);
		return invokes;
	}, {});
}
/**
* Define a unary invoke handler (server side).
*
* The handler can accept a unary or streaming request; it must return
* a single response (or an extendable response envelope).
*
* Triggering workflow:
*
* {@link defineInvoke}
*   -> {@link EventContext.on}
*     -> `sendEvent` / `sendEventError` / `sendEventStreamEnd` / `sendEventAbort`
*       -> {@link defineInvokeHandler}
*
* Upstream:
* - {@link defineInvoke}
*
* Downstream:
* - {@link EventContext.emit}
*
* @example
* ```ts
* const events = defineInvokeEventa<{ id: string }, { name: string }>()
*
* defineInvokeHandler(serverCtx, events, ({ name }) => ({
*   id: `user-${name}`,
* }))
* ```
*
* @param ctx Event context on the handler/server side.
* @param event Invoke event definition created by `defineInvokeEventa`.
* @param handler Handler that returns a response (or response + metadata).
* @returns A disposer that removes protocol listeners and registry ownership. Active handlers keep running; their request streams and abort controllers remain valid until those handlers settle.
*/
function defineInvokeHandler(ctx, event, handler) {
	if (!ctx.invokeHandlers) ctx.invokeHandlers = /* @__PURE__ */ new Map();
	const handlerRegistry = ctx.invokeHandlers;
	let registeredHandlers = handlerRegistry.get(event.sendEvent.id);
	if (!registeredHandlers) {
		registeredHandlers = /* @__PURE__ */ new Map();
		handlerRegistry.set(event.sendEvent.id, registeredHandlers);
	}
	const handlers = registeredHandlers;
	function removeHandler(internalHandler) {
		ctx.off(event.sendEvent, internalHandler.onSend);
		ctx.off(event.sendEventError, internalHandler.onSendError);
		ctx.off(event.sendEventStreamEnd, internalHandler.onSendStreamEnd);
		ctx.off(event.sendEventAbort, internalHandler.onSendAbort);
		internalHandler.cleanup();
		handlers.delete(handler);
		if (handlers.size === 0 && handlerRegistry.get(event.sendEvent.id) === handlers) handlerRegistry.delete(event.sendEvent.id);
	}
	const existingHandler = handlers.get(handler);
	if (existingHandler) return () => removeHandler(existingHandler);
	const requestState = new InvokeState(ctx.signal);
	const handleInvoke = async (invokeId, payload, options) => {
		const abortController = requestState.materialize(invokeId);
		const handlerOptions = options ? {
			...options,
			abortController
		} : { abortController };
		try {
			const response = await handler(payload, handlerOptions);
			await ctx.emit({
				...defineEventa(`${event.receiveEvent.id}-${invokeId}`),
				invokeType: event.receiveEvent.invokeType
			}, {
				invokeId,
				content: response
			}, options);
		} catch (error) {
			try {
				await ctx.emit({
					...defineEventa(`${event.receiveEventError.id}-${invokeId}`),
					invokeType: event.receiveEventError.invokeType
				}, {
					invokeId,
					content: { error }
				}, options);
			} catch {}
		} finally {
			requestState.complete(invokeId);
		}
	};
	const onSend = async (payload, options) => {
		if (!payload.body) return;
		if (!payload.body.invokeId) return;
		const invokeId = payload.body.invokeId;
		if (requestState.shouldIgnoreFrame(invokeId)) return;
		if (payload.body.isReqStream) {
			const { controller, stream } = requestState.openRequestStream(invokeId);
			if (stream) handleInvoke(invokeId, stream, options);
			requestState.pushRequestChunk(invokeId, controller, payload.body.content);
			return;
		}
		handleInvoke(invokeId, payload.body?.content, options);
	};
	const onSendStreamEnd = (payload, options) => {
		if (!payload.body) return;
		if (!payload.body.invokeId) return;
		const invokeId = payload.body.invokeId;
		if (requestState.shouldIgnoreFrame(invokeId)) return;
		const { controller, stream } = requestState.openRequestStream(invokeId);
		if (stream) handleInvoke(invokeId, stream, options);
		requestState.endRequestStream(invokeId, controller);
	};
	const onSendError = (payload, options) => {
		if (!payload.body?.invokeId) return;
		const invokeId = payload.body.invokeId;
		if (requestState.shouldIgnoreFrame(invokeId)) return;
		const { controller, stream } = requestState.openRequestStream(invokeId);
		if (stream) handleInvoke(invokeId, stream, options);
		requestState.errorRequestStream(invokeId, controller, payload.body.content);
	};
	const onSendAbort = (payload, _options) => {
		if (!payload.body) return;
		if (!payload.body.invokeId) return;
		const invokeId = payload.body.invokeId;
		requestState.rememberAbort(invokeId, payload.body.content);
	};
	const cleanup = () => {
		requestState.dispose();
	};
	const internalHandler = {
		onSend,
		onSendError,
		onSendStreamEnd,
		onSendAbort,
		cleanup
	};
	handlers.set(handler, internalHandler);
	ctx.on(event.sendEvent, internalHandler.onSend);
	ctx.on(event.sendEventError, internalHandler.onSendError);
	ctx.on(event.sendEventStreamEnd, internalHandler.onSendStreamEnd);
	ctx.on(event.sendEventAbort, internalHandler.onSendAbort);
	return () => removeHandler(internalHandler);
}
/**
* Define multiple invoke handlers in batch (server side).
*
* @example
* ```ts
* const events = {
*   double: defineInvokeEventa<number, number>(),
*   greet: defineInvokeEventa<string, { name: string }>(),
* }
*
* defineInvokeHandlers(ctx, events, {
*   double: value => value * 2,
*   greet: ({ name }) => `hi ${name}`,
* })
* ```
*
* @param ctx Event context on the handler/server side.
* @param events Map of invoke events created by `defineInvokeEventa`.
* @param handlers Map of handlers keyed by event name.
*/
function defineInvokeHandlers(ctx, events, handlers) {
	const eventKeys = Object.keys(events);
	const handlerKeys = new Set(Object.keys(handlers));
	if (eventKeys.length !== handlerKeys.size || !eventKeys.every((key) => handlerKeys.has(key))) throw new Error("The keys of events and handlers must match.");
	return eventKeys.reduce((returnValues, key) => {
		returnValues[key] = defineInvokeHandler(ctx, events[key], handlers[key]);
		return returnValues;
	}, {});
}
/**
* Remove one or all invoke handlers for a specific invoke event (server side).
*
* @example
* ```ts
* const off = defineInvokeHandler(ctx, events, handler)
* off() // remove one handler
*
* // or remove all handlers for the event:
* undefineInvokeHandler(ctx, events)
* ```
*
* @param ctx Event context on the handler/server side.
* @param event Invoke event definition created by `defineInvokeEventa`.
* @param handler Specific handler to remove (omit to remove all).
* @returns `true` if at least one handler was removed, `false` otherwise
*/
function undefineInvokeHandler(ctx, event, handler) {
	if (!ctx.invokeHandlers) return false;
	const handlers = ctx.invokeHandlers?.get(event.sendEvent.id);
	if (!handlers) return false;
	if (handler) {
		const internalHandler = handlers.get(handler);
		if (!internalHandler) return false;
		ctx.off(event.sendEvent, internalHandler.onSend);
		ctx.off(event.sendEventError, internalHandler.onSendError);
		ctx.off(event.sendEventStreamEnd, internalHandler.onSendStreamEnd);
		ctx.off(event.sendEventAbort, internalHandler.onSendAbort);
		internalHandler.cleanup();
		handlers.delete(handler);
		if (handlers.size === 0) ctx.invokeHandlers.delete(event.sendEvent.id);
		return true;
	}
	let returnValue = false;
	for (const internalHandlers of handlers.values()) {
		ctx.off(event.sendEvent, internalHandlers.onSend);
		ctx.off(event.sendEventError, internalHandlers.onSendError);
		ctx.off(event.sendEventStreamEnd, internalHandlers.onSendStreamEnd);
		ctx.off(event.sendEventAbort, internalHandlers.onSendAbort);
		internalHandlers.cleanup();
		returnValue = true;
	}
	ctx.invokeHandlers.delete(event.sendEvent.id);
	return returnValue;
}
export { isExtendableInvokeResponseLike as a, createAbortError as c, createUntilTriggeredOnce as d, isAbortError as f, randomBetween as h, defineInvokes as i, createUntil as l, isReadableStream as m, defineInvokeHandler as n, undefineInvokeHandler as o, isAsyncIterable as p, defineInvokeHandlers as r, InvokeState as s, defineInvoke as t, createUntilTriggered as u };

//# sourceMappingURL=invoke-C68JwPdT.mjs.map