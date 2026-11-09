declare function nanoid(): string;
interface InvokeEventConstraint<_Req, _Res> {}
type EventTag<Res, Req> = string & InvokeEventConstraint<Req, Res>;
declare enum EventaType {
  Event = "event",
  MatchExpression = "matchExpression"
}
declare enum EventaFlowDirection {
  Inbound = "inbound",
  Outbound = "outbound"
}
interface DirectionalEventa<P, T = undefined> extends Eventa<P> {
  _flowDirection: EventaFlowDirection | T;
}
interface InboundEventa<T> extends DirectionalEventa<T> {
  _flowDirection: EventaFlowDirection.Inbound;
}
interface OutboundEventa<T> extends DirectionalEventa<T> {
  _flowDirection: EventaFlowDirection.Outbound;
}
declare function defineInboundEventa<T>(id?: string): InboundEventa<T>;
declare function defineOutboundEventa<T>(id?: string): OutboundEventa<T>;
interface EventaLike<_P = undefined, T extends EventaType = EventaType> {
  id: string;
  type?: T;
}
interface Eventa<P = unknown, M = unknown, IM = unknown> extends EventaLike<P, EventaType.Event> {
  body?: P;
  /**
   * Optional runtime metadata that can be attached to the eventa.
   *
   * NOTICE: for defineInvoke, and defineInvokeHandler, the metadata will be omitted
   * for smaller chunk size, this means for metadata, the data contains will not be available in the defineInvokeHandler.
   *
   * This can be used for various purposes such as logging, debugging, or providing additional context about the eventa.
   * Allowing the event handler to be able to access this metadata can enable more flexible and powerful event handling logic.
   */
  metadata?: M;
  /**
   * Optional runtime metadata that can be attached to the eventa when invoking it.
   *
   * Unlike the `metadata` field, the `invokeMetadata` is specifically designed to be used when invoking the eventa, and it
   * will be available in the defineInvokeHandler.
   *
   * This allows for a clear separation between the metadata that describes the eventa itself and the metadata that is relevant
   * to the invocation of the eventa, providing more flexibility in how metadata is used and accessed within the event
   * handling system.
   */
  invokeMetadata?: IM;
}
type InferEventaPayload<E> = E extends Eventa<infer P> ? P : never;
declare function defineEventa<P = undefined, M = undefined, IM = undefined>(id?: string, options?: {
  /**
   * Optionally inherit many properties from another parent eventa.
   */
  inheritFrom?: Eventa<P, M, IM>;
  /**
   * Optional runtime metadata that can be attached to the eventa.
   *
   * NOTICE: for defineInvoke, and defineInvokeHandler, the metadata will be omitted
   * for smaller chunk size, this means for metadata, the data contains will not be available in the defineInvokeHandler.
   *
   * This can be used for various purposes such as logging, debugging, or providing additional context about the eventa.
   * Allowing the event handler to be able to access this metadata can enable more flexible and powerful event handling logic.
   */
  metadata?: M;
  /**
   * Optional runtime metadata that can be attached to the eventa when invoking it.
   *
   * Unlike the `metadata` field, the `invokeMetadata` is specifically designed to be used when invoking the eventa, and it
   * will be available in the defineInvokeHandler.
   *
   * This allows for a clear separation between the metadata that describes the eventa itself and the metadata that is relevant
   * to the invocation of the eventa, providing more flexibility in how metadata is used and accessed within the event
   * handling system.
   */
  invokeMetadata?: IM;
}): Eventa<P, M, IM>;
interface EventaMatchExpression<P = undefined> extends EventaLike<P, EventaType.MatchExpression> {
  matcher?: (event: Eventa<P>) => boolean | Promise<boolean>;
}
declare function and<P>(...matchExpression: Array<EventaMatchExpression<P>>): EventaMatchExpression<P>;
declare function or<P>(...matchExpression: Array<EventaMatchExpression<P>>): EventaMatchExpression<P>;
/**
 * Match by is powerful utility function that allows you to create a match expression based on various criteria
 * when working with eventa (event system).
 *
 * Semantics like glob matching, RegExp, or even custom matcher function can be used to create complex match
 * expressions that can be used to filter and handle events in a flexible way.
 */
declare function matchBy<P = undefined>(glob: string, inverted?: boolean): EventaMatchExpression<P>;
declare function matchBy<P = undefined>(options: {
  ids: string[];
}, inverted?: boolean): EventaMatchExpression<P>;
declare function matchBy<P = undefined>(options: {
  eventa: Eventa<P>[];
}, inverted?: boolean): EventaMatchExpression<P>;
declare function matchBy<P = undefined>(options: {
  types: EventaType[];
}, inverted?: boolean): EventaMatchExpression<P>;
declare function matchBy<P = undefined>(regExp: RegExp, inverted?: boolean): EventaMatchExpression<P>;
declare function matchBy<P = undefined, E extends Eventa<P> = Eventa<P>>(matcher: (event: E) => boolean | Promise<boolean>): EventaMatchExpression<P>;
/**
 * One emitted Eventa occurrence travelling through a routing graph.
 *
 * Routing creates a new value when consuming hop budget. The inner identity
 * and Eventa remain stable unless an edge plugin transforms the business event.
 *
 * @template T Eventa body type carried by this routed value.
 */
interface EventaInner<T = unknown> {
  /** Correlates one emitted occurrence across fan-out, hops, and transports. */
  readonly deliveryId: string;
  /** Remaining edge crossings; a zero-hop inner value still dispatches locally. */
  readonly hopsRemaining: number;
  /** Application event carried without transport-specific options. */
  readonly eventa: Eventa<T>;
}
interface EventContextRoutingOptions {
  /** Maximum delivery IDs retained for duplicate suppression. @default 10000 */
  recentDeliveryLimit?: number;
  /** Time in milliseconds that a delivery ID remains known. @default 300000 */
  recentDeliveryTtl?: number;
  /** Hop budget assigned to each local emit. @default 32 */
  initialHops?: number;
  /** Receives non-routable observations about delivery routing. */
  onDiagnostic?: (diagnostic: EventContextRoutingDiagnostic) => void;
}
/** A local routing observation that is never forwarded as an Eventa. */
interface EventContextRoutingDiagnostic {
  readonly kind: 'hops-exhausted';
  readonly inner: Readonly<EventaInner>;
}
interface CreateContextOptions {
  /** Delivery routing policy owned by this context. */
  routing?: EventContextRoutingOptions;
}
/**
 * Creates an Eventa subscription and routing context.
 *
 * The context associates one delivery identity with each emitted Eventa before
 * dispatch. Forwarding listeners preserve that identity when they emit into
 * another Context. Recent IDs are bounded by both retention time and capacity;
 * concurrent emit calls are intentionally unordered.
 */
declare function createContext<Extensions = undefined, Options = {
  raw?: unknown;
}>(options?: CreateContextOptions): EventContext<Extensions, Options>;
interface EventContext<Extensions = undefined, EmitOptions = undefined> {
  listeners: Map<EventTag<any, any>, Set<(params: any) => any>>;
  onceListeners: Map<EventTag<any, any>, Set<(params: any) => any>>;
  /**
   * Dispatches and forwards one event. Concurrent calls are independent and
   * have no ordering guarantee; the promise tracks only this emitted event.
   */
  emit: <P>(event: Eventa<P>, payload: P, options?: EmitOptions) => Promise<void>;
  on: <P>(eventOrMatchExpression: Eventa<P> | EventaMatchExpression<P>, handler: (payload: Eventa<P>, options?: EmitOptions) => any) => () => void;
  once: <P>(eventOrMatchExpression: Eventa<P> | EventaMatchExpression<P>, handler: (payload: Eventa<P>, options?: EmitOptions) => any) => () => void;
  off: <P>(eventOrMatchExpression: Eventa<P> | EventaMatchExpression<P>, handler?: (payload: Eventa<P>, options?: EmitOptions) => any) => void;
  /**
   * Lifetime signal for this context. Transport adapters abort it when their
   * owned transport dies; linked contexts retain independent lifetimes.
   */
  signal: AbortSignal;
  /**
   * Terminates this context lifetime. The first reason is retained and reaches
   * pending invokes; repeated calls are no-ops.
   */
  abort: (reason?: unknown) => void;
  /** Adapter-specific capabilities attached to this context. */
  extensions?: Extensions;
}
type EventContextEmitFn = EventContext['emit'];
export { matchBy as C, defineOutboundEventa as S, or as T, InvokeEventConstraint as _, EventContextRoutingOptions as a, defineEventa as b, DirectionalEventa as c, EventaFlowDirection as d, EventaLike as f, InferEventaPayload as g, InboundEventa as h, EventContextRoutingDiagnostic as i, EventTag as l, EventaType as m, EventContext as n, createContext as o, EventaMatchExpression as p, EventContextEmitFn as r, EventaInner as s, CreateContextOptions as t, Eventa as u, OutboundEventa as v, nanoid as w, defineInboundEventa as x, and as y };
//# sourceMappingURL=context-BCSkPp2Y.d.mts.map