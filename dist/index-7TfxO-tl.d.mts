import { l as EventTag, n as EventContext, s as EventaInner, u as Eventa } from "./context-BCSkPp2Y.mjs";
type ChannelPluginResult = false | void | Eventa<unknown> | Promise<false | void | Eventa<unknown>>;
interface ChannelPluginContext<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown> {
  source: EventContext<FromExtensions, FromEmitOptions>;
  target: EventContext<ToExtensions, ToEmitOptions>;
  direction?: string;
  inner: Readonly<EventaInner>;
}
type ChannelPlugin<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown> = (event: Eventa<unknown>, context: ChannelPluginContext<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>) => ChannelPluginResult;
interface ChannelLinkPluginContext<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> {
  source: EventContext<LeftExtensions, LeftEmitOptions> | EventContext<RightExtensions, RightEmitOptions>;
  target: EventContext<LeftExtensions, LeftEmitOptions> | EventContext<RightExtensions, RightEmitOptions>;
  direction?: string;
  inner: Readonly<EventaInner>;
}
type ChannelLinkPlugin<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> = (event: Eventa<unknown>, context: ChannelLinkPluginContext<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>) => ChannelPluginResult;
declare function defineChannelPlugin<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown>(plugin: ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>): ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>;
interface ChannelPipe<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown> {
  use: (plugin: ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>) => () => void;
  dispose: () => void;
}
interface ChannelPipeGroup<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown> extends ChannelPipe<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions> {
  pipes: Array<ChannelPipe<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>>;
}
interface ChannelContext {
  emit: <Payload>(event: Eventa<Payload>, payload: Payload, options?: never) => Promise<void>;
  on: <Payload>(event: Eventa<Payload>, handler: (payload: Eventa<Payload>) => unknown) => () => void;
  signal: AbortSignal;
  abort: (reason?: unknown) => void;
}
type ContextExtensionsOf<Context> = Context extends EventContext<infer Extensions, infer _EmitOptions> ? Extensions : never;
type ContextEmitOptionsOf<Context> = Context extends EventContext<infer _Extensions, infer EmitOptions> ? EmitOptions : never;
type PipeFor<From extends ChannelContext, To extends ChannelContext> = ChannelPipe<ContextExtensionsOf<From>, ContextEmitOptionsOf<From>, ContextExtensionsOf<To>, ContextEmitOptionsOf<To>>;
/** Directed pipes for each adjacent pair in a context tuple, in chain order. */
type ChannelPipes<Contexts extends readonly ChannelContext[]> = Contexts extends readonly [infer From extends ChannelContext, infer To extends ChannelContext, ...infer Rest extends ChannelContext[]] ? [PipeFor<From, To>, ...ChannelPipes<[To, ...Rest]>] : [];
/** Runtime edge observed by a plugin shared across an ordered context chain. */
interface ChannelChainPluginContext<Contexts extends readonly ChannelContext[]> {
  source: Contexts[number];
  target: Contexts[number];
  direction?: string;
  inner: Readonly<EventaInner>;
}
/** Plugin applied to every directed edge created for an ordered context chain. */
type ChannelChainPlugin<Contexts extends readonly ChannelContext[]> = (event: Eventa<unknown>, context: ChannelChainPluginContext<Contexts>) => ChannelPluginResult;
/** Options shared by every adjacent directed edge in a pipe chain. */
interface ChannelChainOptions<Contexts extends readonly ChannelContext[]> {
  plugins?: ChannelChainPlugin<Contexts> | Array<ChannelChainPlugin<Contexts>>;
  direction?: string;
}
/** Options shared by both directions of every adjacent edge in a link chain. */
interface ChannelLinkChainOptions<Contexts extends readonly ChannelContext[]> {
  plugins?: ChannelChainPlugin<Contexts> | Array<ChannelChainPlugin<Contexts>>;
}
/** Handle for an ordered `a -> b -> c` pipe chain. */
interface ChannelPipeChain<Contexts extends readonly ChannelContext[]> {
  /** One pipe per adjacent pair, ordered from the first context to the last. */
  pipes: ChannelPipes<Contexts>;
  /** Adds a plugin to every pipe in this chain. */
  use: (plugin: ChannelChainPlugin<Contexts>) => () => void;
  /** Removes only this chain's edges; context lifetimes remain independent. */
  dispose: () => void;
}
interface ChannelPipeOptions<FromExtensions = unknown, FromEmitOptions = unknown, ToExtensions = unknown, ToEmitOptions = unknown> {
  plugins?: ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions> | Array<ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>>;
  direction?: string;
}
interface ChannelLinkOptions<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> {
  plugins?: ChannelLinkPlugin<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions> | Array<ChannelLinkPlugin<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>>;
}
interface ChannelLink<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> {
  pipes: Array<ChannelPipe<unknown, unknown, unknown, unknown>>;
  use: (plugin: ChannelLinkPlugin<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>) => () => void;
  dispose: () => void;
}
/** Forward and reverse pipes for each adjacent pair, in pair order. */
type ChannelLinkPipes<Contexts extends readonly ChannelContext[]> = Contexts extends readonly [infer Left extends ChannelContext, infer Right extends ChannelContext, ...infer Rest extends ChannelContext[]] ? [PipeFor<Left, Right>, PipeFor<Right, Left>, ...ChannelLinkPipes<[Right, ...Rest]>] : [];
/** Handle for an ordered `a <-> b <-> c` bidirectional link chain. */
interface ChannelLinkChain<Contexts extends readonly ChannelContext[]> {
  /** Two pipes per adjacent pair: forward first, then reverse. */
  pipes: ChannelLinkPipes<Contexts>;
  /** Adds a plugin to both directions of every link in this chain. */
  use: (plugin: ChannelChainPlugin<Contexts>) => () => void;
  /** Removes only this chain's edges; context lifetimes remain independent. */
  dispose: () => void;
}
type ChannelConnectionOptions<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> = ChannelLinkOptions<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>;
type ChannelConnection<LeftExtensions = unknown, LeftEmitOptions = unknown, RightExtensions = unknown, RightEmitOptions = unknown> = ChannelLink<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>;
declare function pipeChannel<FromExtensions = undefined, FromEmitOptions = undefined, ToExtensions = undefined, ToEmitOptions = undefined>(from: EventContext<FromExtensions, FromEmitOptions>, to: EventContext<ToExtensions, ToEmitOptions>, options?: ChannelPipeOptions<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions> | ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions> | Array<ChannelPlugin<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>>): ChannelPipeGroup<FromExtensions, FromEmitOptions, ToExtensions, ToEmitOptions>;
declare function pipeChannel<const Contexts extends readonly [ChannelContext, ChannelContext, ChannelContext, ...ChannelContext[]]>(...contextsAndOptions: [...Contexts] | [...Contexts, ChannelChainOptions<Contexts> | ChannelChainPlugin<Contexts> | Array<ChannelChainPlugin<Contexts>>]): ChannelPipeChain<Contexts>;
declare function pipeChannel<Extensions, EmitOptions>(from: EventContext<Extensions, EmitOptions>, firstTo: EventContext<Extensions, EmitOptions>, ...contextsAndOptions: Array<EventContext<Extensions, EmitOptions> | ChannelPipeOptions<Extensions, EmitOptions, Extensions, EmitOptions> | ChannelPlugin<Extensions, EmitOptions, Extensions, EmitOptions> | Array<ChannelPlugin<Extensions, EmitOptions, Extensions, EmitOptions>> | undefined>): ChannelPipeGroup<Extensions, EmitOptions, Extensions, EmitOptions>;
declare function linkChannel<LeftExtensions = undefined, LeftEmitOptions = undefined, RightExtensions = undefined, RightEmitOptions = undefined>(left: EventContext<LeftExtensions, LeftEmitOptions>, right: EventContext<RightExtensions, RightEmitOptions>, options?: ChannelLinkOptions<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>): ChannelLink<LeftExtensions, LeftEmitOptions, RightExtensions, RightEmitOptions>;
declare function linkChannel<const Contexts extends readonly [ChannelContext, ChannelContext, ChannelContext, ...ChannelContext[]]>(...contextsAndOptions: [...Contexts] | [...Contexts, ChannelLinkChainOptions<Contexts>]): ChannelLinkChain<Contexts>;
declare function linkChannel<Extensions, EmitOptions>(...contextsAndOptions: Array<EventContext<Extensions, EmitOptions> | ChannelLinkOptions<Extensions, EmitOptions, Extensions, EmitOptions> | undefined>): ChannelLink<Extensions, EmitOptions, Extensions, EmitOptions>;
declare enum InvokeEventType {
  SendEvent = 0,
  SendEventError = 1,
  SendEventStreamEnd = 2,
  SendEventAbort = 3,
  ReceiveEvent = 4,
  ReceiveEventError = 5,
  ReceiveEventStreamEnd = 6
}
interface SendEvent<Res, Req = undefined, _ = undefined, __ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: Req;
  isReqStream?: boolean;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.SendEvent;
}
interface SendEventError<Res, Req = undefined, _ = undefined, ReqErr = Error, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: ReqErr;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.SendEventError;
}
interface SendEventStreamEnd<Res, Req = undefined, _ = undefined, __ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: undefined;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.SendEventStreamEnd;
}
interface SendEventAbort<Res, Req = undefined, _ = undefined, __ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content?: unknown;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.SendEventAbort;
}
interface ReceiveEvent<Res, Req = undefined, _ = undefined, __ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: Res;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.ReceiveEvent;
}
interface ReceiveEventError<Res, Req = undefined, ResErr = undefined, _ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: {
    error: ResErr;
  };
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.ReceiveEventError;
}
interface ReceiveEventStreamEnd<Res, Req = undefined, _ = undefined, __ = undefined, M = undefined, IM = undefined> extends Eventa<{
  invokeId: string;
  content: undefined;
}, M, IM> {
  id: EventTag<Res, Req>;
  invokeType: InvokeEventType.ReceiveEventStreamEnd;
}
interface InvokeEventa<Res, Req = undefined, ResErr = Error, ReqErr = Error, M = undefined, IM = undefined> {
  sendEvent: SendEvent<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventError: SendEventError<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventStreamEnd: SendEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventAbort: SendEventAbort<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEvent: ReceiveEvent<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEventError: ReceiveEventError<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEventStreamEnd: ReceiveEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM>;
}
interface InvokeHandlerEventa<Res, Req = undefined, ResErr = Error, ReqErr = Error, M = undefined, _IM = undefined> extends InvokeEventa<Res, Req, ResErr, ReqErr, M, undefined> {
  sendEvent: SendEvent<Res, Req, ResErr, ReqErr, M, undefined>;
  sendEventError: SendEventError<Res, Req, ResErr, ReqErr, M, undefined>;
  sendEventStreamEnd: SendEventStreamEnd<Res, Req, ResErr, ReqErr, M, undefined>;
  sendEventAbort: SendEventAbort<Res, Req, ResErr, ReqErr, M, undefined>;
  receiveEvent: ReceiveEvent<Res, Req, ResErr, ReqErr, M, undefined>;
  receiveEventError: ReceiveEventError<Res, Req, ResErr, ReqErr, M, undefined>;
  receiveEventStreamEnd: ReceiveEventStreamEnd<Res, Req, ResErr, ReqErr, M, undefined>;
}
type InferSendEvent<T> = T extends {
  sendEvent: SendEvent<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? SendEvent<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferSendEventError<T> = T extends {
  sendEventError: SendEventError<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? SendEventError<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferSendEventStreamEnd<T> = T extends {
  sendEventStreamEnd: SendEventStreamEnd<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? SendEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferSendEventAbort<T> = T extends {
  sendEventAbort: SendEventAbort<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? SendEventAbort<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferReceiveEvent<T> = T extends {
  receiveEvent: ReceiveEvent<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? ReceiveEvent<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferReceiveEventError<T> = T extends {
  receiveEventError: ReceiveEventError<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? ReceiveEventError<Res, Req, ResErr, ReqErr, M, IM> : never;
type InferReceiveEventStreamEnd<T> = T extends {
  receiveEventStreamEnd: ReceiveEventStreamEnd<infer Res, infer Req, infer ResErr, infer ReqErr, infer M, infer IM>;
} ? ReceiveEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM> : never;
declare function defineInvokeEventa<Res, Req = undefined, ResErr = Error, ReqErr = Error, M = undefined, IM = undefined>(tag?: string, options?: {
  metadata?: M;
  invokeMetadata?: IM;
}): {
  sendEvent: SendEvent<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventError: SendEventError<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventStreamEnd: SendEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM>;
  sendEventAbort: SendEventAbort<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEvent: ReceiveEvent<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEventError: ReceiveEventError<Res, Req, ResErr, ReqErr, M, IM>;
  receiveEventStreamEnd: ReceiveEventStreamEnd<Res, Req, ResErr, ReqErr, M, IM>;
};
declare function isInvokeEventa(event: Eventa<any>): event is SendEvent<any, any, any, any, any, any> | SendEventError<any, any, any, any, any, any> | SendEventStreamEnd<any, any, any, any, any, any> | ReceiveEvent<any, any, any, any, any, any> | ReceiveEventError<any, any, any, any, any, any> | ReceiveEventStreamEnd<any, any, any, any, any, any> | SendEventAbort<any, any, any, any, any, any>;
declare function isSendEvent(event: Eventa<any>): event is SendEvent<any, any, any, any, any, any> | SendEventError<any, any, any, any, any, any> | SendEventStreamEnd<any, any, any, any, any, any> | SendEventAbort<any, any, any, any, any, any>;
declare function isReceiveEvent(event: Eventa<any>): event is ReceiveEvent<any, any, any, any, any, any> | ReceiveEventError<any, any, any, any, any, any> | ReceiveEventStreamEnd<any, any, any, any, any, any>;
type IsInvokeRequestOptional<EC extends EventContext<any, any>> = EC extends EventContext<infer E, any> ? E extends {
  invokeRequest: any;
} ? undefined extends E['invokeRequest'] ? true : false : E extends {
  invokeRequest?: any;
} ? undefined extends E['invokeRequest'] ? true : false : true : true;
type ExtractInvokeRequestOptions<EC extends EventContext<any, any>> = EC extends EventContext<infer E, any> ? E extends {
  invokeRequest: infer IR;
} ? IR & {
  signal?: AbortSignal;
} : E extends {
  invokeRequest?: infer IR;
} ? IR & {
  signal?: AbortSignal;
} : {
  signal?: AbortSignal;
} : {
  signal?: AbortSignal;
};
type ExtractInvokeResponseOptions<EC extends EventContext<any, any>> = EC extends EventContext<infer E, any> ? E extends {
  invokeResponse: infer IR;
} ? IR : E extends {
  invokeResponse?: infer IR;
} ? IR : undefined : undefined;
type InvokeFunction<Res, Req, EC extends EventContext<any, any>> = [Req] extends [undefined] ? IsInvokeRequestOptional<EC> extends true ? (req?: Req, options?: ExtractInvokeRequestOptions<EC>) => Promise<Res> : (req: Req, options: ExtractInvokeRequestOptions<EC>) => Promise<Res> : IsInvokeRequestOptional<EC> extends true ? (req: Req, options?: ExtractInvokeRequestOptions<EC>) => Promise<Res> : (req: Req, options: ExtractInvokeRequestOptions<EC>) => Promise<Res>;
type InvokeFunctionMap<EventMap extends Record<string, InvokeEventa<any, any, any, any>>, EC extends EventContext<any, any>> = { [K in keyof EventMap]: EventMap[K] extends InvokeEventa<infer Res, infer Req, any, any> ? InvokeFunction<Res, Req, EC> : never; };
type ExtendableInvokeResponse<Res, EC extends EventContext<any, any>> = Promise<Res> | Res | Promise<{
  response: Res;
  invokeResponse?: ExtractInvokeResponseOptions<EC>;
}> | {
  response: Res;
  invokeResponse?: ExtractInvokeResponseOptions<EC>;
};
declare function isExtendableInvokeResponseLike<Res, EC extends EventContext<any, any>>(value: Eventa<unknown> | ReceiveEvent<{
  response: Res;
  invokeResponse?: unknown;
}>): value is ReceiveEvent<{
  response: Res;
  invokeResponse?: ExtractInvokeResponseOptions<EC>;
}>;
type Handler<Res, Req = any, EC extends EventContext<any, any> = EventContext<any, any>, RawEventOptions = unknown> = (payload: Req, options?: {
  abortController?: AbortController;
} & RawEventOptions) => ExtendableInvokeResponse<Res, EC>;
interface InternalInvokeHandler<Res, Req = any, ResErr = Error, ReqErr = Error, EO = any, M = undefined, IM = undefined> {
  onSend: (params: Eventa<NonNullable<InvokeEventa<Res, Req, ResErr, ReqErr, M, IM>['sendEvent']['body']>>, eventOptions?: EO) => void;
  onSendError: (params: Eventa<NonNullable<InvokeEventa<Res, Req, ResErr, ReqErr, M, IM>['sendEventError']['body']>>, eventOptions?: EO) => void;
  onSendStreamEnd: (params: Eventa<NonNullable<InvokeEventa<Res, Req, ResErr, ReqErr, M, IM>['sendEventStreamEnd']['body']>>, eventOptions?: EO) => void;
  onSendAbort: (params: Eventa<NonNullable<InvokeEventa<Res, Req, ResErr, ReqErr, M, IM>['sendEventAbort']['body']>>, eventOptions?: EO) => void;
  cleanup: () => void;
}
type HandlerMap<EventMap extends Record<string, InvokeEventa<any, any, any, any, any, any>>, EO = any, EC extends EventContext<any, any> = EventContext<any, any>> = { [K in keyof EventMap]: EventMap[K] extends InvokeEventa<infer Res, infer Req, any, any, any, any> ? Handler<Res, Req, EC, EO> : never; };
interface InvocableEventContext<E, EO> extends EventContext<E, EO> {
  invokeHandlers?: Map<string, Map<Handler<any, any, any, any>, InternalInvokeHandler<any, any, any, any, any, any, any>>>;
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
declare function defineInvoke<Res, Req = undefined, ResErr = Error, ReqErr = Error, M = undefined, IM = undefined, CtxExt = any, EOpts = any, ECtx extends EventContext<CtxExt, EOpts> = EventContext<CtxExt, EOpts>>(ctx: ECtx | (() => ECtx | Promise<ECtx>), event: InvokeEventa<Res, Req, ResErr, ReqErr, M, IM>): InvokeFunction<Res, Req, ECtx>;
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
declare function defineInvokes<EK extends string, EventMap extends Record<EK, InvokeEventa<any, any, any, any, any, any>>, CtxExt = any, EOpts = any, ECtx extends EventContext<CtxExt, EOpts> = EventContext<CtxExt, EOpts>>(ctx: ECtx | (() => ECtx | Promise<ECtx>), events: EventMap): InvokeFunctionMap<EventMap, ECtx>;
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
declare function defineInvokeHandler<Res, Req = undefined, ResErr = Error, ReqErr = Error, M = undefined, IM = undefined, CtxExt = any, EOpts extends {
  raw?: any;
} = any>(ctx: InvocableEventContext<CtxExt, EOpts>, event: InvokeHandlerEventa<Res, Req, ResErr, ReqErr, M, IM>, handler: Handler<Res, Req, InvocableEventContext<CtxExt, EOpts>, EOpts>): () => void;
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
declare function defineInvokeHandlers<EK extends string, EventMap extends Record<EK, InvokeEventa<any, any, any, any>>, CtxExt = any, EOpts extends {
  raw?: any;
} = any>(ctx: InvocableEventContext<CtxExt, EOpts>, events: EventMap, handlers: HandlerMap<EventMap, EOpts>): Record<EK, () => void>;
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
declare function undefineInvokeHandler<Res, Req = undefined, ResErr = Error, ReqErr = Error, CtxExt = any, EOpts = any>(ctx: InvocableEventContext<CtxExt, EOpts>, event: InvokeEventa<Res, Req, ResErr, ReqErr>, handler?: Handler<Res, Req, InvocableEventContext<CtxExt, EOpts>, EOpts>): boolean;
interface WithTransfer<T> {
  message: T;
  _transfer?: Transferable[];
}
declare function withTransfer<T>(body: T, transfer?: Transferable[]): ExtendableInvokeResponse<T, EventContext<{
  invokeResponse?: {
    transfer?: Transferable[];
  };
}, any>>;
interface InvokeFunctionStubOptions {
  allow?: boolean;
  maxDepth?: number;
  maxFunctions?: number;
  tagPrefix?: string;
  onDisallowedTag?: 'ignore' | 'throw';
  autoDisposeMs?: number;
  strict?: boolean;
}
type RemoteInvokeOptions<EC extends EventContext<any, any>> = ExtractInvokeRequestOptions<EC> & {
  functionStubs?: boolean | InvokeFunctionStubOptions;
};
interface RemoteInvokeResult<Res> extends Promise<Res> {
  dispose: () => void;
}
type RemoteInvokeFunction<Res, Req, EC extends EventContext<any, any>> = [Req] extends [undefined] ? (req?: Req, options?: RemoteInvokeOptions<EC>) => RemoteInvokeResult<Res> : (req: Req, options?: RemoteInvokeOptions<EC>) => RemoteInvokeResult<Res>;
declare function createRemoteMethodTagPrefix(prefix?: string): string;
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
declare function withRemoteMethods(defaultOptions?: boolean | InvokeFunctionStubOptions): {
  defineInvoke<Res, Req = undefined, ResErr = Error, ReqErr = Error, CtxExt = any, EOpts = any, ECtx extends EventContext<CtxExt, EOpts> = EventContext<CtxExt, EOpts>>(ctx: ECtx, event: InvokeEventa<Res, Req, ResErr, ReqErr>): RemoteInvokeFunction<Res, Req, ECtx>;
  defineInvokeHandler<Res, Req = undefined, ResErr = Error, ReqErr = Error, CtxExt = any, EOpts extends {
    raw?: any;
  } = any>(ctx: InvocableEventContext<CtxExt, EOpts>, event: InvokeEventa<Res, Req, ResErr, ReqErr>, handler: Handler<Res, Req, InvocableEventContext<CtxExt, EOpts>, EOpts>): () => void;
};
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
declare function defineStreamInvoke<Res, Req = undefined, ResErr = Error, ReqErr = Error, E = any, EO = any>(clientCtx: EventContext<E, EO>, event: InvokeEventa<Res, Req, ResErr, ReqErr>): (req: Req | ReadableStream<Req> | AsyncIterable<Req>, options?: ExtractInvokeRequestOptions<EventContext<E, EO>>) => ReadableStream<Res>;
type StreamHandler<Res, Req = any, RawEventOptions = unknown> = (payload: Req, options?: {
  abortController?: AbortController;
} & RawEventOptions) => AsyncGenerator<Res, void, unknown>;
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
declare function defineStreamInvokeHandler<Res, Req = undefined, ResErr = Error, ReqErr = Error, E = any, EO extends {
  raw?: any;
} = any>(serverCtx: EventContext<E, EO>, event: InvokeEventa<Res, Req, ResErr, ReqErr>, fn: StreamHandler<Res, Req, EO>): () => void;
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
declare function toStreamHandler<Req, Res, EO extends {
  raw?: any;
} = any>(handler: (context: {
  payload: Req;
  options?: EO;
  emit: (data: Res) => void;
}) => Promise<void>): StreamHandler<Res, Req, EO>;
declare function randomBetween(min: number, max: number): number;
/**
 * Checks if a value is an AsyncIterable.
 *
 * @param value
 * @returns True if the value is an AsyncIterable.
 */
declare function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T>;
/**
 * Checks if an object is a ReadableStream.
 *
 * @link https://github.com/cloudflare/workerd/blob/88e8696ce7a5f8969a7e02a2dcfb6504c17c9e8d/src/cloudflare/internal/streaming-forms.ts#L3
 * @param obj
 * @returns True if the object looks like a ReadableStream.
 */
declare function isReadableStream<T>(obj?: unknown | null): obj is ReadableStream<T>;
declare function createAbortError(reason?: unknown): Error;
declare function isAbortError(error: unknown): error is Error;
declare function createUntilTriggeredOnce<F extends (...args: any[]) => any, P extends any[] = Parameters<F>, R = ReturnType<F>>(fn: F): {
  onceTriggered: Promise<Awaited<R>>;
  wrapper: (...args: P) => Promise<Awaited<R>>;
};
declare function createUntilTriggered<P, R>(fn: (...args: P[]) => R): {
  promise: Promise<void>;
  handler: () => void;
};
declare function createUntil<T>(options?: {
  intervalHandler?: () => Promise<boolean>;
  interval?: number;
}): {
  promise: Promise<T>;
  handler: (value: T) => void;
};
export { isReceiveEvent as $, defineInvokeHandlers as A, InferSendEventStreamEnd as B, Handler as C, pipeChannel as Ct, InvokeFunctionMap as D, InvokeFunction as E, InferReceiveEventError as F, ReceiveEventError as G, InvokeEventa as H, InferReceiveEventStreamEnd as I, SendEventAbort as J, ReceiveEventStreamEnd as K, InferSendEvent as L, isExtendableInvokeResponseLike as M, undefineInvokeHandler as N, defineInvoke as O, InferReceiveEvent as P, isInvokeEventa as Q, InferSendEventAbort as R, ExtractInvokeResponseOptions as S, linkChannel as St, InvocableEventContext as T, InvokeHandlerEventa as U, InvokeEventType as V, ReceiveEvent as W, SendEventStreamEnd as X, SendEventError as Y, defineInvokeEventa as Z, withRemoteMethods as _, ChannelPipes as _t, isAbortError as a, ChannelConnectionOptions as at, ExtendableInvokeResponse as b, ChannelPluginResult as bt, randomBetween as c, ChannelLinkChainOptions as ct, toStreamHandler as d, ChannelLinkPlugin as dt, isSendEvent as et, InvokeFunctionStubOptions as f, ChannelLinkPluginContext as ft, createRemoteMethodTagPrefix as g, ChannelPipeOptions as gt, RemoteInvokeResult as h, ChannelPipeGroup as ht, createUntilTriggeredOnce as i, ChannelConnection as it, defineInvokes as j, defineInvokeHandler as k, defineStreamInvoke as l, ChannelLinkOptions as lt, RemoteInvokeOptions as m, ChannelPipeChain as mt, createUntil as n, ChannelChainPlugin as nt, isAsyncIterable as o, ChannelLink as ot, RemoteInvokeFunction as p, ChannelPipe as pt, SendEvent as q, createUntilTriggered as r, ChannelChainPluginContext as rt, isReadableStream as s, ChannelLinkChain as st, createAbortError as t, ChannelChainOptions as tt, defineStreamInvokeHandler as u, ChannelLinkPipes as ut, WithTransfer as v, ChannelPlugin as vt, HandlerMap as w, ExtractInvokeRequestOptions as x, defineChannelPlugin as xt, withTransfer as y, ChannelPluginContext as yt, InferSendEventError as z };
//# sourceMappingURL=index-7TfxO-tl.d.mts.map