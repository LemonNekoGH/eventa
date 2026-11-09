import { _ as matchBy, a as isSendEvent, c as getPreviousContext, d as EventaFlowDirection, f as EventaType, g as defineOutboundEventa, h as defineInboundEventa, i as isReceiveEvent, m as defineEventa, n as defineInvokeEventa, o as createContext, p as and, r as isInvokeEventa, s as getEventaInner, t as InvokeEventType, u as setEventaInner, v as nanoid, y as or } from "./invoke-shared-BgaCcbG9.mjs";
import { a as isExtendableInvokeResponseLike, c as createAbortError, d as createUntilTriggeredOnce, f as isAbortError, h as randomBetween, i as defineInvokes, l as createUntil, m as isReadableStream, n as defineInvokeHandler, o as undefineInvokeHandler, p as isAsyncIterable, r as defineInvokeHandlers, s as InvokeState, t as defineInvoke, u as createUntilTriggered } from "./invoke-C68JwPdT.mjs";
// src/channel.ts
function defineChannelPlugin(plugin) {
	return plugin;
}
function isEventContext(value) {
	return typeof value === "object" && value !== null && typeof value.emit === "function" && typeof value.on === "function";
}
function normalizePlugins(plugins) {
	if (!plugins) return [];
	return Array.isArray(plugins) ? [...plugins] : [plugins];
}
function isPipeOptions(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) && !isEventContext(value);
}
function parsePipeOptions(value) {
	if (typeof value === "function" || Array.isArray(value)) return { plugins: value };
	return isPipeOptions(value) ? value : {};
}
function isPromiseLike(value) {
	return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}
function applyPlugins(inner, plugins, source, target, direction) {
	const context = {
		source,
		target,
		direction
	};
	function runPlugin(index, event) {
		if (index >= plugins.length) return event === inner.eventa ? inner : {
			...inner,
			eventa: event
		};
		const currentInner = event === inner.eventa ? inner : {
			...inner,
			eventa: event
		};
		const result = plugins[index](event, {
			...context,
			inner: currentInner
		});
		if (isPromiseLike(result)) return Promise.resolve(result).then((resolved) => {
			if (resolved === false) return;
			return runPlugin(index + 1, typeof resolved === "undefined" ? event : resolved);
		});
		if (result === false) return;
		return runPlugin(index + 1, typeof result === "undefined" ? event : result);
	}
	return runPlugin(0, inner.eventa);
}
function forwardInner(inner, plugins, source, target, direction) {
	const transformed = applyPlugins(inner, plugins, source, target, direction);
	const emit = (result) => {
		if (!result) return;
		const eventa = { ...result.eventa };
		delete eventa._flowDirection;
		setEventaInner(eventa, {
			...result,
			eventa
		}, source);
		return target.emit(eventa, eventa.body, void 0);
	};
	if (isPromiseLike(transformed)) return Promise.resolve(transformed).then(emit);
	return emit(transformed);
}
function createDirectedPipe(source, target, sharedPlugins, direction) {
	const localPlugins = [];
	const off = source.on(matchBy("*"), (event) => {
		const inner = getEventaInner(event);
		if (!inner) return;
		if (getPreviousContext(event) === target) return;
		return forwardInner(inner, [...sharedPlugins, ...localPlugins], source, target, direction);
	});
	let disposed = false;
	return {
		use(plugin) {
			if (disposed) throw new Error("Channel pipe disposed.");
			localPlugins.push(plugin);
			return () => {
				const index = localPlugins.indexOf(plugin);
				if (index >= 0) localPlugins.splice(index, 1);
			};
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			off();
			localPlugins.length = 0;
		}
	};
}
function createLinkedPair(left, right, sharedPlugins, leftIndex) {
	return [createDirectedPipe(left, right, sharedPlugins, getLinkDirection(leftIndex, leftIndex + 1)), createDirectedPipe(right, left, sharedPlugins, getLinkDirection(leftIndex + 1, leftIndex))];
}
function getLinkDirection(sourceIndex, targetIndex) {
	if (sourceIndex === 0 && targetIndex === 1) return "left-to-right";
	if (sourceIndex === 1 && targetIndex === 0) return "right-to-left";
	return `context-${sourceIndex}-to-${targetIndex}`;
}
function createGroup(pipes, sharedPlugins) {
	let disposed = false;
	return {
		pipes,
		use(plugin) {
			if (disposed) throw new Error("Channel pipe disposed.");
			sharedPlugins.push(plugin);
			return () => {
				const index = sharedPlugins.indexOf(plugin);
				if (index >= 0) sharedPlugins.splice(index, 1);
			};
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			for (const pipe of pipes) pipe.dispose();
			sharedPlugins.length = 0;
		}
	};
}
function pipeChannel(...args) {
	const [from, firstTo, ...contextsAndOptions] = args;
	const contexts = [from, firstTo];
	let options = {};
	for (const item of contextsAndOptions) if (isEventContext(item)) contexts.push(item);
	else if (typeof item !== "undefined") options = parsePipeOptions(item);
	const sharedPlugins = normalizePlugins(options.plugins);
	return createGroup(contexts.slice(0, -1).map((source, index) => createDirectedPipe(source, contexts[index + 1], sharedPlugins, options.direction)), sharedPlugins);
}
function linkChannel(...args) {
	const contextsAndOptions = args;
	const contexts = [];
	let options = {};
	for (const item of contextsAndOptions) if (isEventContext(item)) contexts.push(item);
	else if (item) options = item;
	const sharedPlugins = normalizePlugins(options.plugins);
	const pipes = [];
	for (let index = 0; index < contexts.length - 1; index += 1) {
		const [forward, backward] = createLinkedPair(contexts[index], contexts[index + 1], sharedPlugins, index);
		pipes.push(forward, backward);
	}
	return createGroup(pipes, sharedPlugins);
}
// src/invoke-extension-transfer.ts
function withTransfer(body, transfer) {
	return {
		response: body,
		invokeResponse: { transfer: transfer ?? [] }
	};
}
// src/invoke-remote-methods.ts
const DEFAULT_FUNCTION_STUB_OPTIONS = {
	maxDepth: 32,
	maxFunctions: 32,
	tagPrefix: "eventa-invoke-fn-",
	onDisallowedTag: "ignore",
	autoDisposeMs: 0,
	strict: false
};
function createRemoteMethodTagPrefix(prefix = DEFAULT_FUNCTION_STUB_OPTIONS.tagPrefix) {
	return `${prefix}${nanoid()}-`;
}
function normalizeFunctionStubOptions(options) {
	if (options === true) return {
		allow: true,
		...DEFAULT_FUNCTION_STUB_OPTIONS
	};
	if (!options) return {
		allow: false,
		...DEFAULT_FUNCTION_STUB_OPTIONS
	};
	return {
		allow: options.allow ?? true,
		maxDepth: options.maxDepth ?? DEFAULT_FUNCTION_STUB_OPTIONS.maxDepth,
		maxFunctions: options.maxFunctions ?? DEFAULT_FUNCTION_STUB_OPTIONS.maxFunctions,
		tagPrefix: options.tagPrefix ?? DEFAULT_FUNCTION_STUB_OPTIONS.tagPrefix,
		onDisallowedTag: options.onDisallowedTag ?? DEFAULT_FUNCTION_STUB_OPTIONS.onDisallowedTag,
		autoDisposeMs: options.autoDisposeMs ?? DEFAULT_FUNCTION_STUB_OPTIONS.autoDisposeMs,
		strict: options.strict ?? DEFAULT_FUNCTION_STUB_OPTIONS.strict
	};
}
function resolveFunctionStubOptions(defaults, override) {
	const base = normalizeFunctionStubOptions(defaults);
	if (typeof override === "undefined") return base;
	if (typeof override === "boolean") return {
		...base,
		allow: override
	};
	return {
		...base,
		...normalizeFunctionStubOptions(override)
	};
}
function isPlainObject(value) {
	if (value == null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
function isInvokeFunctionStubPayload(value) {
	if (!isPlainObject(value)) return false;
	if (!("__eventaInvoke" in value)) return false;
	const stub = value.__eventaInvoke;
	return !!stub && typeof stub === "object" && typeof stub.tag === "string";
}
function hasInvokeFunctionStubKey(value) {
	return isPlainObject(value) && "__eventaInvoke" in value;
}
function serializeInvokeFunctionPayload(value, ctx, options) {
	if (!options.allow) return {
		value,
		dispose: () => void 0
	};
	let functionCount = 0;
	const seen = /* @__PURE__ */ new WeakMap();
	const disposers = [];
	const walk = (input, depth) => {
		if (typeof input === "function") {
			if (functionCount >= options.maxFunctions) throw new Error(`Too many function stubs in invoke payload (max ${options.maxFunctions}).`);
			functionCount += 1;
			const tag = `${options.tagPrefix}${nanoid()}`;
			const event = defineInvokeEventa(tag);
			const off = defineInvokeHandler(ctx, event, (payload, handlerOptions) => {
				return input(payload, handlerOptions);
			});
			disposers.push(off);
			return { __eventaInvoke: { tag } };
		}
		if (input == null || typeof input !== "object") return input;
		if (depth > options.maxDepth) throw new Error(`Invoke payload is too deep (max ${options.maxDepth}).`);
		if (seen.has(input)) return seen.get(input);
		if (Array.isArray(input)) {
			const output = Array.from({ length: input.length });
			seen.set(input, output);
			for (let i = 0; i < input.length; i += 1) output[i] = walk(input[i], depth + 1);
			return output;
		}
		if (!isPlainObject(input)) return input;
		const output = Object.create(null);
		seen.set(input, output);
		for (const [key, child] of Object.entries(input)) output[key] = walk(child, depth + 1);
		return output;
	};
	return {
		value: walk(value, 0),
		dispose: () => {
			for (const off of disposers) off();
		}
	};
}
function deserializeInvokeFunctionPayload(value, ctx, options) {
	if (!options.allow) return value;
	let functionCount = 0;
	const seen = /* @__PURE__ */ new WeakMap();
	const walk = (input, depth) => {
		if (input == null || typeof input !== "object") return input;
		if (depth > options.maxDepth) throw new Error(`Invoke payload is too deep (max ${options.maxDepth}).`);
		if (isInvokeFunctionStubPayload(input)) {
			if (functionCount >= options.maxFunctions) throw new Error(`Too many function stubs in invoke payload (max ${options.maxFunctions}).`);
			const tag = input.__eventaInvoke.tag;
			if (options.tagPrefix && !tag.startsWith(options.tagPrefix)) {
				if (options.onDisallowedTag === "throw") throw new Error(`Invoke function tag not allowed: ${tag}`);
				return input;
			}
			functionCount += 1;
			const event = defineInvokeEventa(tag);
			return defineInvoke(ctx, event);
		} else if (options.strict && hasInvokeFunctionStubKey(input)) throw new Error("Invalid invoke function stub payload.");
		if (seen.has(input)) return seen.get(input);
		if (Array.isArray(input)) {
			const output = Array.from({ length: input.length });
			seen.set(input, output);
			for (let i = 0; i < input.length; i += 1) output[i] = walk(input[i], depth + 1);
			return output;
		}
		if (!isPlainObject(input)) return input;
		const output = Object.create(null);
		seen.set(input, output);
		for (const [key, child] of Object.entries(input)) output[key] = walk(child, depth + 1);
		return output;
	};
	return walk(value, 0);
}
/**
* Enable "remote method" payloads for invoke: functions in the request body are
* serialized into stub descriptors and rehydrated into invoke callers on the
* receiving side.
*
* This is an adapter around the plain-value RPC primitives `defineInvoke` and
* `defineInvokeHandler`. It keeps the core invoke APIs clean while offering an
* opt-in bridge for function values.
*
* @example
* ```ts
* const remote = withRemoteMethods({ allow: true })
* const events = defineInvokeEventa<{ output: number }, { helper: (n: number) => Promise<number> }>()
*
* // server (handler)
* remote.defineInvokeHandler(serverCtx, events, async ({ helper }) => {
*   const output = await helper(21)
*   return { output }
* })
*
* // client (caller)
* const invoke = remote.defineInvoke(clientCtx, events)
* const result = await invoke({ helper: async n => n * 2 }, { functionStubs: true })
* ```
*
* @example
* ```ts
* // Manual cleanup when you fire-and-forget or cancel midway:
* const invoke = remote.defineInvoke(clientCtx, events)
* const result = invoke({ helper: () => 'ok' }, { functionStubs: true })
* result.dispose()
* await result
* ```
*
* Security notes:
* - This feature is off by default. Enabling it allows the remote side to call
*   back into your process; only use with trusted peers.
* - Function stubs are tagged; prefer a unique `tagPrefix` to avoid collisions
*   (see `createRemoteMethodTagPrefix`).
* - `maxDepth`, `maxFunctions`, and `autoDisposeMs` limit attack surface and
*   resource usage. `autoDisposeMs` is useful for fire-and-forget calls.
* - Objects are rebuilt with a null prototype to mitigate `__proto__` pollution.
* - Enable `strict` to reject malformed `__eventaInvoke` payloads.
*
* @param defaultOptions Defaults for function stub behavior. Use `{ allow: true }`
*        to enable, or provide `maxDepth`, `maxFunctions`, `tagPrefix`,
*        `onDisallowedTag`, `autoDisposeMs`, and `strict` for stricter control.
*/
function withRemoteMethods(defaultOptions) {
	return {
		defineInvoke(ctx, event) {
			const baseInvoke = defineInvoke(ctx, event);
			const invoke = ((req, options) => {
				const { functionStubs, ...invokeOptions } = options ?? {};
				const normalizedOptions = resolveFunctionStubOptions(defaultOptions, functionStubs);
				if (!normalizedOptions.allow) {
					const wrapped = baseInvoke(req, invokeOptions);
					wrapped.dispose = () => void 0;
					return wrapped;
				}
				let serialized;
				try {
					serialized = serializeInvokeFunctionPayload(req, ctx, normalizedOptions);
				} catch (error) {
					const rejected = Promise.reject(error);
					rejected.dispose = () => void 0;
					return rejected;
				}
				let disposed = false;
				const dispose = () => {
					if (disposed) return;
					disposed = true;
					serialized.dispose();
				};
				let autoDisposeTimer;
				if (normalizedOptions.autoDisposeMs > 0) autoDisposeTimer = setTimeout(() => {
					dispose();
				}, normalizedOptions.autoDisposeMs);
				const finalize = () => {
					if (autoDisposeTimer) clearTimeout(autoDisposeTimer);
					dispose();
				};
				const wrapped = baseInvoke(serialized.value, invokeOptions).finally(finalize);
				wrapped.dispose = finalize;
				return wrapped;
			});
			return invoke;
		},
		defineInvokeHandler(ctx, event, handler) {
			const normalizedOptions = resolveFunctionStubOptions(defaultOptions);
			return defineInvokeHandler(ctx, event, async (payload, options) => {
				return handler(normalizedOptions.allow ? deserializeInvokeFunctionPayload(payload, ctx, normalizedOptions) : payload, options);
			});
		}
	};
}
// src/stream.ts
/**
* Create a stream invoke function (client side).
*
* Use when the response is streamed and the request may be unary or streaming.
* Request and response chunks are ordered within this invocation even though
* the underlying context does not order independent emits.
*
* Common patterns:
* - Unary request -> stream response (server-streaming)
* - Stream request -> stream response (bi-directional streaming)
*
* @example
* ```ts
* // 1) Define eventa once (shared by client/server)
* const events = defineInvokeEventa<Progress | Result, Params>()
*
* // 2) Client: define invoke function
* const invoke = defineStreamInvoke(clientCtx, events)
*
* // 3) Call with unary request
* for await (const msg of invoke({ name: 'alice' })) {
*   console.log(msg)
* }
* ```
*
* @example
* ```ts
* // Client-streaming request
* const input = new ReadableStream<number>({
*   start(c) { c.enqueue(1); c.enqueue(2); c.close() },
* })
*
* for await (const msg of invoke(input)) {
*   console.log(msg)
* }
* ```
*
* @param clientCtx Event context on the caller/client side.
* @param event Invoke event definition created by `defineInvokeEventa`.
*/
function defineStreamInvoke(clientCtx, event) {
	return (req, options) => {
		const invokeId = nanoid();
		const { signal, ...emitOptions } = options ?? {};
		const requestEmitOptions = emitOptions;
		let onAbort;
		let onContextAbort;
		let stopped = false;
		let cleanup = () => void 0;
		let finishError = (_reason) => void 0;
		const invokeReceiveEvent = defineEventa(`${event.receiveEvent.id}-${invokeId}`);
		const invokeReceiveEventError = defineEventa(`${event.receiveEventError.id}-${invokeId}`);
		const invokeReceiveEventStreamEnd = defineEventa(`${event.receiveEventStreamEnd.id}-${invokeId}`);
		const sendAbort = (reason) => {
			clientCtx.emit(event.sendEventAbort, {
				invokeId,
				content: reason
			}, requestEmitOptions).catch(() => void 0);
		};
		const stream = new ReadableStream({
			start(controller) {
				cleanup = () => {
					clientCtx.off(invokeReceiveEvent);
					clientCtx.off(invokeReceiveEventError);
					clientCtx.off(invokeReceiveEventStreamEnd);
					if (signal && onAbort) signal.removeEventListener("abort", onAbort);
					if (onContextAbort) clientCtx.signal.removeEventListener("abort", onContextAbort);
				};
				finishError = (reason) => {
					if (stopped) return;
					stopped = true;
					controller.error(reason);
					cleanup();
				};
				onAbort = () => {
					sendAbort(signal?.reason);
					finishError(createAbortError(signal?.reason));
				};
				onContextAbort = () => finishError(clientCtx.signal.reason);
				clientCtx.on(invokeReceiveEvent, (payload) => {
					if (!payload.body) return;
					if (payload.body.invokeId !== invokeId) return;
					if (stopped) return;
					controller.enqueue(payload.body.content);
				});
				clientCtx.on(invokeReceiveEventError, (payload) => {
					if (!payload.body) return;
					if (payload.body.invokeId !== invokeId) return;
					finishError(payload.body.content.error);
				});
				clientCtx.on(invokeReceiveEventStreamEnd, (payload) => {
					if (!payload.body) return;
					if (payload.body.invokeId !== invokeId) return;
					if (stopped) return;
					stopped = true;
					controller.close();
					cleanup();
				});
				if (clientCtx.signal.aborted) {
					onContextAbort();
					return;
				}
				clientCtx.signal.addEventListener("abort", onContextAbort, { once: true });
				if (signal && onAbort) {
					if (signal.aborted) {
						onAbort();
						return;
					}
					signal.addEventListener("abort", onAbort, { once: true });
				}
			},
			cancel(reason) {
				if (!stopped) {
					stopped = true;
					sendAbort(reason);
				}
				cleanup();
			}
		});
		if (stopped) return stream;
		if (isReadableStream(req) || isAsyncIterable(req)) {
			const sendChunk = (chunk) => {
				return clientCtx.emit(event.sendEvent, {
					invokeId,
					content: chunk,
					isReqStream: true
				}, requestEmitOptions);
			};
			const sendEnd = () => {
				return clientCtx.emit(event.sendEventStreamEnd, {
					invokeId,
					content: void 0
				}, requestEmitOptions);
			};
			const pump = async () => {
				let sending = false;
				try {
					for await (const chunk of req) {
						if (stopped) return;
						sending = true;
						await sendChunk(chunk);
						sending = false;
						if (stopped) return;
					}
					if (stopped) return;
					sending = true;
					await sendEnd();
				} catch (error) {
					if (sending) sendAbort(error);
					else {
						finishError(error);
						try {
							await clientCtx.emit(event.sendEventError, {
								invokeId,
								content: error
							}, requestEmitOptions);
						} catch (publishError) {
							sendAbort(publishError);
						}
					}
					if (sending) finishError(error);
				}
			};
			pump();
		} else clientCtx.emit(event.sendEvent, {
			invokeId,
			content: req
		}, requestEmitOptions).catch(finishError);
		return stream;
	};
}
/**
* Define a stream invoke handler (server side).
*
* The handler can receive either:
* - a unary request `Req`
* - a streaming request `ReadableStream<Req>` / `AsyncIterable<Req>`
*
* It must return an async generator of response messages.
*
* Triggering workflow:
*
* {@link defineStreamInvoke}
*   -> {@link EventContext.on}
*     -> `sendEvent` / `sendEventError` / `sendEventStreamEnd` / `sendEventAbort`
*       -> {@link defineStreamInvokeHandler}
*
* Upstream:
* - {@link defineStreamInvoke}
*
* Downstream:
* - {@link EventContext.emit}
*
* @example
* ```ts
* const events = defineInvokeEventa<Progress | Result, Params>()
*
* defineStreamInvokeHandler(serverCtx, events, async function* (payload) {
*   if (isReadableStream<Params>(payload) || isAsyncIterable<Params>(payload)) {
*     for await (const item of payload) {
*       yield { type: 'progress', value: item }
*     }
*   }
*
*   yield { type: 'result', ok: true }
* })
* ```
*
* @param serverCtx Event context on the handler/server side.
* @param event Invoke event definition created by `defineInvokeEventa`.
* @param fn Stream handler that yields response chunks.
* @returns A disposer that removes protocol listeners and context-lifetime tracking. Active handlers keep running; their request streams and abort controllers remain valid until those handlers settle.
*/
function defineStreamInvokeHandler(serverCtx, event, fn) {
	const invokeReceiveEvent = (invokeId) => defineEventa(`${event.receiveEvent.id}-${invokeId}`);
	const invokeReceiveEventError = (invokeId) => defineEventa(`${event.receiveEventError.id}-${invokeId}`);
	const invokeReceiveEventStreamEnd = (invokeId) => defineEventa(`${event.receiveEventStreamEnd.id}-${invokeId}`);
	const requestState = new InvokeState(serverCtx.signal);
	const handleInvoke = async (invokeId, payload, options) => {
		const receiveEvent = invokeReceiveEvent(invokeId);
		const receiveEventError = invokeReceiveEventError(invokeId);
		const receiveEventStreamEnd = invokeReceiveEventStreamEnd(invokeId);
		const abortController = requestState.materialize(invokeId);
		const handlerOptions = options ? {
			...options,
			abortController
		} : { abortController };
		try {
			const generator = fn(payload, handlerOptions);
			for await (const res of generator) await serverCtx.emit(receiveEvent, {
				invokeId,
				content: res
			}, options);
			await serverCtx.emit(receiveEventStreamEnd, {
				invokeId,
				content: void 0
			}, options);
		} catch (error) {
			try {
				await serverCtx.emit(receiveEventError, {
					invokeId,
					content: { error }
				}, options);
			} catch {}
		} finally {
			requestState.complete(invokeId);
		}
	};
	const offSend = serverCtx.on(event.sendEvent, async (payload, options) => {
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
		handleInvoke(invokeId, payload.body.content, options);
	});
	const offStreamEnd = serverCtx.on(event.sendEventStreamEnd, (payload, options) => {
		if (!payload.body) return;
		if (!payload.body.invokeId) return;
		const invokeId = payload.body.invokeId;
		if (requestState.shouldIgnoreFrame(invokeId)) return;
		const { controller, stream } = requestState.openRequestStream(invokeId);
		if (stream) handleInvoke(invokeId, stream, options);
		requestState.endRequestStream(invokeId, controller);
	});
	const offSendError = serverCtx.on(event.sendEventError, (payload, options) => {
		if (!payload.body?.invokeId) return;
		const invokeId = payload.body.invokeId;
		if (requestState.shouldIgnoreFrame(invokeId)) return;
		const { controller, stream } = requestState.openRequestStream(invokeId);
		if (stream) handleInvoke(invokeId, stream, options);
		requestState.errorRequestStream(invokeId, controller, payload.body.content);
	});
	const offAbort = serverCtx.on(event.sendEventAbort, (payload) => {
		if (!payload.body) return;
		if (!payload.body.invokeId) return;
		requestState.rememberAbort(payload.body.invokeId, payload.body.content);
	});
	return () => {
		offSend();
		offSendError();
		offStreamEnd();
		offAbort();
		requestState.dispose();
	};
}
/**
* Convert a callback-style handler into a stream handler.
*
* Use `emit` to push response chunks, and return when done.
* Works for unary or streaming requests.
*
* @example
* ```ts
* defineStreamInvokeHandler(ctx, events, toStreamHandler(async ({ payload, emit }) => {
*   if (isReadableStream<Params>(payload) || isAsyncIterable<Params>(payload)) {
*     for await (const item of payload) {
*       emit({ type: 'progress', value: item })
*     }
*
*     emit({ type: 'result', ok: true })
*     return
*   }
*
*   emit({ type: 'result', ok: true })
* }))
* ```
*
* @param handler Callback handler with `emit` for streaming responses.
*/
function toStreamHandler(handler) {
	return (payload, options) => {
		const values = [];
		let resolve;
		let handlerError = null;
		values.push(new Promise((r) => {
			resolve = r;
		}));
		const emit = (data) => {
			resolve([data, false]);
			values.push(new Promise((r) => {
				resolve = r;
			}));
		};
		handler({
			payload,
			options,
			emit
		}).then(() => {
			resolve([void 0, true]);
		}).catch((err) => {
			handlerError = err;
			resolve([void 0, true]);
		});
		return async function* () {
			let val;
			for (let i = 0, done = false; !done; i++) {
				[val, done] = await values[i];
				delete values[i];
				if (handlerError) throw handlerError;
				if (!done) yield val;
			}
		}();
	};
}
export { EventaFlowDirection, EventaType, InvokeEventType, and, createAbortError, createContext, createRemoteMethodTagPrefix, createUntil, createUntilTriggered, createUntilTriggeredOnce, defineChannelPlugin, defineEventa, defineInboundEventa, defineInvoke, defineInvokeEventa, defineInvokeHandler, defineInvokeHandlers, defineInvokes, defineOutboundEventa, defineStreamInvoke, defineStreamInvokeHandler, isAbortError, isAsyncIterable, isExtendableInvokeResponseLike, isInvokeEventa, isReadableStream, isReceiveEvent, isSendEvent, linkChannel, matchBy, nanoid, or, pipeChannel, randomBetween, toStreamHandler, undefineInvokeHandler, withRemoteMethods, withTransfer };

//# sourceMappingURL=index.mjs.map