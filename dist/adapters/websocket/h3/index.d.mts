import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../../context-BCSkPp2Y.mjs";
/**
 * Headers accepted by the runtime `Headers` constructor (`HeadersInit`).
 */
type HeadersInit = NonNullable<ConstructorParameters<typeof globalThis.Headers>[0]>;
type DOMHighResTimeStamp = number;
type BinaryType = "blob" | "arraybuffer";
type MessageEventSource = unknown;
type EventListenerOrEventListenerObject = ((evt: Event) => void) | {
  handleEvent(object: Event): void;
};
interface WebSocketEventMap {
  close: CloseEvent;
  error: Event;
  message: MessageEvent$1;
  open: Event;
}
/**
 * A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent)
 */
interface CloseEvent extends Event {
  /**
   * Returns the WebSocket connection close code provided by the server.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/code)
   */
  readonly code: number;
  /**
   * Returns the WebSocket connection close reason provided by the server.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/reason)
   */
  readonly reason: string;
  /**
   * Returns true if the connection closed cleanly; false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/wasClean)
   */
  readonly wasClean: boolean;
}
/**
 * An event which takes place in the DOM.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event)
 */
interface Event {
  /**
   * Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/bubbles)
   */
  readonly bubbles: boolean;
  /**
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/cancelBubble)
   */
  cancelBubble: boolean;
  /**
   * Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/cancelable)
   */
  readonly cancelable: boolean;
  /**
   * Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/composed)
   */
  readonly composed: boolean;
  /**
   * Returns the object whose event listener's callback is currently being invoked.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/currentTarget)
   */
  readonly currentTarget: EventTarget | null;
  /**
   * Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/defaultPrevented)
   */
  readonly defaultPrevented: boolean;
  /**
   * Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/eventPhase)
   */
  readonly eventPhase: number;
  /**
   * Returns true if event was dispatched by the user agent, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/isTrusted)
   */
  readonly isTrusted: boolean;
  /**
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/returnValue)
   */
  returnValue: boolean;
  /**
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/srcElement)
   */
  readonly srcElement: EventTarget | null;
  /**
   * Returns the object to which event is dispatched (its target).
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/target)
   */
  readonly target: EventTarget | null;
  /**
   * Returns the event's timestamp as the number of milliseconds measured relative to the time origin.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/timeStamp)
   */
  readonly timeStamp: DOMHighResTimeStamp;
  /**
   * Returns the type of event, e.g. "click", "hashchange", or "submit".
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/type)
   */
  readonly type: string;
  /**
   * Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/composedPath)
   */
  composedPath(): EventTarget[];
  /**
   * @deprecated
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/initEvent)
   */
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  /**
   * If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/preventDefault)
   */
  preventDefault(): void;
  /**
   * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/stopImmediatePropagation)
   */
  stopImmediatePropagation(): void;
  /**
   * When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/stopPropagation)
   */
  stopPropagation(): void;
  readonly NONE: 0;
  readonly CAPTURING_PHASE: 1;
  readonly AT_TARGET: 2;
  readonly BUBBLING_PHASE: 3;
}
/**
 * EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget)
 */
interface EventTarget {
  /**
   * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
   *
   * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
   *
   * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
   *
   * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
   *
   * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
   *
   * If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.
   *
   * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)
   */
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
  /**
   * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)
   */
  dispatchEvent(event: Event): boolean;
  /**
   * Removes the event listener in target's event listener list with the same type, callback, and options.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener)
   */
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}
/**
 * A message received by a target object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent)
 */
interface MessageEvent$1<T = any> extends Event {
  /**
   * Returns the data of the message.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/data)
   */
  readonly data: T;
  /**
   * Returns the last event ID string, for server-sent events.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/lastEventId)
   */
  readonly lastEventId: string;
  /**
   * Returns the origin of the message, for server-sent events and cross-document messaging.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/origin)
   */
  readonly origin: string;
  /**
   * Returns the MessagePort array sent with the message, for cross-document messaging and channel messaging.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/ports)
   */
  readonly ports: ReadonlyArray<MessagePort>;
  /**
   * Returns the WindowProxy of the source window, for cross-document messaging, and the MessagePort being attached, in the connect event fired at SharedWorkerGlobalScope objects.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/source)
   */
  readonly source: MessageEventSource | null;
  /** @deprecated */
  initMessageEvent(type: string, bubbles?: boolean, cancelable?: boolean, data?: any, origin?: string, lastEventId?: string, source?: MessageEventSource | null, ports?: MessagePort[]): void;
}
/**
 * Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket)
 */
interface WebSocket extends EventTarget {
  /**
   * Returns a string that indicates how binary data from the WebSocket object is exposed to scripts:
   *
   * Can be set, to change how binary data is returned. The default is "blob".
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/binaryType)
   */
  binaryType: BinaryType | (string & {});
  /**
   * Returns the number of bytes of application data (UTF-8 text and binary data) that have been queued using send() but not yet been transmitted to the network.
   *
   * If the WebSocket connection is closed, this attribute's value will only increase with each call to the send() method. (The number does not reset to zero once the connection closes.)
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/bufferedAmount)
   */
  readonly bufferedAmount: number;
  /**
   * Returns the extensions selected by the server, if any.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/extensions)
   */
  readonly extensions: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/close_event) */
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/error_event) */
  onerror: ((this: WebSocket, ev: Event) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/message_event) */
  onmessage: ((this: WebSocket, ev: MessageEvent$1) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/open_event) */
  onopen: ((this: WebSocket, ev: Event) => any) | null;
  /**
   * Returns the subprotocol selected by the server, if any. It can be used in conjunction with the array form of the constructor's second argument to perform subprotocol negotiation.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/protocol)
   */
  readonly protocol: string;
  /**
   * Returns the state of the WebSocket object's connection. It can have the values described below.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/readyState)
   */
  readonly readyState: number;
  /**
   * Returns the URL that was used to establish the WebSocket connection.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/url)
   */
  readonly url: string;
  /**
   * Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/close)
   */
  close(code?: number, reason?: string): void;
  /**
   * Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/send)
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSING: 2;
  readonly CLOSED: 3;
  addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
declare class WSError extends Error {
  constructor(...args: any[]);
}
/**
 * A single pub/sub event relayed between crossws instances.
 *
 * This is the minimal unit a sync backplane needs to transport so that a
 * `peer.publish()` (or `adapter.publish()`) on one instance reaches the
 * subscribers connected to every other instance.
 */
interface SyncMessage {
  /**
   * Pub/sub namespace (matches {@link Peer.namespace}).
   *
   * An empty string means "all namespaces" and mirrors a server-side
   * `adapter.publish(topic, data)` call without an explicit `namespace`.
   */
  namespace: string;
  /** Channel / topic name. */
  topic: string;
  /**
   * Message payload.
   *
   * crossws normalizes payloads to a string or `Uint8Array` before handing
   * them to the driver. Encoding for the wire (e.g. base64 for binary over a
   * text transport) is the driver's responsibility.
   */
  data: string | Uint8Array;
}
/**
 * A live connection to a sync backplane, scoped to one crossws instance.
 *
 * Created by a {@link SyncAdapter}. crossws calls {@link SyncDriver.publish}
 * for every local publish and expects {@link SyncDriver.subscribe} to invoke
 * the supplied `deliver` callback for every message originating from *other*
 * instances.
 */
interface SyncDriver {
  /**
   * Start receiving messages relayed from other instances.
   *
   * The driver MUST call `deliver` for every remote message; crossws then
   * fans it out to local subscribers. The driver MUST NOT echo this
   * instance's own publishes back (backplanes like Redis pub/sub echo by
   * default — use the instance `id` from {@link SyncAdapter} to filter).
   */
  subscribe(deliver: (message: SyncMessage) => void): MaybePromise<void>;
  /** Relay a locally-published message to the other instances. */
  publish(message: SyncMessage): MaybePromise<void>;
  /** Optional teardown when the adapter shuts down. */
  close?(): MaybePromise<void>;
}
declare const kNodeInspect: unique symbol;
interface PeerContext$1 extends Record<string, unknown> {}
interface WaitForDrainOptions {
  /**
   * Resolve once {@link Peer.bufferedAmount} drops to or below this many bytes.
   *
   * @default 0
   */
  threshold?: number;
  /**
   * Polling interval (in milliseconds) used to re-check {@link Peer.bufferedAmount}.
   *
   * @default 100
   */
  pollInterval?: number;
  /**
   * Abort the wait (e.g. `AbortSignal.timeout(ms)`). The returned promise
   * rejects with the signal's `reason`.
   */
  signal?: AbortSignal;
}
interface AdapterInternal {
  ws: unknown;
  request: Request;
  namespace: string;
  peers?: Set<Peer>;
  context?: PeerContext$1;
  /** Optional sync backplane used to relay publishes to other instances. */
  sync?: SyncDriver;
}
declare abstract class Peer<Internal extends AdapterInternal = AdapterInternal> {
  #private;
  protected _internal: Internal;
  protected _topics: Set<string>;
  protected _id?: string;
  constructor(internal: Internal);
  get context(): PeerContext$1;
  get namespace(): string;
  /**
   * Unique random [uuid v4](https://developer.mozilla.org/en-US/docs/Glossary/UUID) identifier for the peer.
   */
  get id(): string;
  /** IP address of the peer */
  get remoteAddress(): string | undefined;
  /** upgrade request */
  get request(): Request;
  /**
   * Get the [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) instance.
   *
   * **Note:** crossws adds polyfill for the following properties if native values are not available:
   * - `protocol`: Extracted from the `sec-websocket-protocol` header.
   * - `extensions`: Extracted from the `sec-websocket-extensions` header.
   * - `url`: Extracted from the request URL (http -> ws).
   * */
  get websocket(): Partial<WebSocket>;
  /** All connected peers to the server */
  get peers(): Set<Peer>;
  /** All topics, this peer has been subscribed to. */
  get topics(): Set<string>;
  /**
   * Number of bytes queued for transmission but not yet flushed to the client.
   *
   * Use this to apply backpressure: pause sending while it grows past a high
   * watermark and resume once it drops (or on the `drain` hook). Returns `0` on
   * adapters that do not expose a buffer signal. Refer to the
   * [compatibility table](https://crossws.h3.dev/guide/peer#compatibility).
   */
  get bufferedAmount(): number;
  /**
   * Wait until the send buffer drains to `threshold` bytes (default `0`).
   *
   * Resolves immediately when there is no backpressure (or on adapters that do
   * not expose {@link Peer.bufferedAmount}). Otherwise it polls every
   * `pollInterval` milliseconds until the buffer drains, also resolving early if
   * the connection is no longer open so a send loop never hangs on a dropped
   * client.
   *
   * ```ts
   * for (const chunk of stream) {
   *   peer.send(chunk);
   *   if (peer.bufferedAmount > 1024 * 1024) {
   *     await peer.waitForDrain({ threshold: 256 * 1024 });
   *   }
   * }
   * ```
   */
  waitForDrain(opts?: WaitForDrainOptions): Promise<void>;
  abstract close(code?: number, reason?: string): void;
  /** Abruptly close the connection */
  terminate(): void;
  /**
   * Send an application-level WebSocket ping control frame to the client.
   *
   * Pair with the {@link Hooks.pong} hook (e.g. embedding a timestamp in
   * `data`) to measure round-trip latency, or rely on the {@link Hooks.ping}
   * hook to observe pings the client sends unprompted.
   *
   * `data` is optional and, per RFC 6455, must not exceed 125 bytes (a ping is
   * a control frame); an over-long or otherwise invalid payload is reported via
   * the {@link Hooks.error} hook instead of being sent.
   *
   * **Note:** Not all adapters can send a ping frame; unsupported adapters
   * warn once and no-op. Refer to the
   * [compatibility table](https://crossws.h3.dev/guide/peer#compatibility).
   */
  ping(_data?: unknown): number | void | undefined;
  /** Subscribe to a topic */
  subscribe(topic: string): void;
  /** Unsubscribe from a topic */
  unsubscribe(topic: string): void;
  /** Send a message to the peer. */
  abstract send(data: unknown, options?: {
    compress?: boolean;
  }): number | void | undefined;
  /**
   * Send a message to subscribers of a topic.
   *
   * When a sync backplane is configured, the message is also relayed to the
   * other crossws instances so their subscribers receive it too.
   */
  publish(topic: string, data: unknown, options?: {
    compress?: boolean;
  }): void;
  /**
   * Adapter-specific, relay-free local fan-out to subscribers of a topic
   * (excludes this peer). Implemented by each adapter; used both by
   * {@link Peer.publish} and by the internal cross-instance delivery path.
   *
   * @internal Adapter extension point, not part of the stable public API.
   */
  abstract _publish(topic: string, data: unknown, options?: {
    compress?: boolean;
  }): void;
  toString(): string;
  [Symbol.toPrimitive](): string;
  [Symbol.toStringTag](): "WebSocket";
  [kNodeInspect](): unknown;
}
declare class Message implements Partial<MessageEvent> {
  #private;
  /** Access to the original [message event](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event) if available. */
  readonly event?: MessageEvent;
  /** Access to the Peer that emitted the message. */
  readonly peer?: Peer;
  /** Raw message data (can be of any type). */
  readonly rawData: unknown;
  constructor(rawData: unknown, peer: Peer, event?: MessageEvent);
  /**
   * Unique random [uuid v4](https://developer.mozilla.org/en-US/docs/Glossary/UUID) identifier for the message.
   */
  get id(): string;
  /**
   * Get data as [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) value.
   *
   * If raw data is in any other format or string, it will be automatically converted and encoded.
   */
  uint8Array(): Uint8Array;
  /**
   * Get data as [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) or [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) value.
   *
   * If raw data is in any other format or string, it will be automatically converted and encoded.
   */
  arrayBuffer(): ArrayBuffer | SharedArrayBuffer;
  /**
   * Get data as [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) value.
   *
   * If raw data is in any other format or string, it will be automatically converted and encoded. */
  blob(): Blob;
  /**
   * Get stringified text version of the message.
   *
   * If raw data is in any other format, it will be automatically converted and decoded.
   */
  text(): string;
  /**
   * Get parsed version of the message text with [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).
   */
  json<T = unknown>(): T;
  /**
   * Message data (value varies based on `peer.websocket.binaryType`).
   */
  get data(): unknown;
  toString(): string;
  [Symbol.toPrimitive](): string;
  [kNodeInspect](): unknown;
}
type MaybePromise<T> = T | Promise<T>;
/**
 * `permessage-deflate` (RFC 7692) settings for a single connection. Mirrors the
 * `perMessageDeflate` server option of [`ws`](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback),
 * which applies it on Node.js.
 */
interface PerMessageDeflateOptions {
  /** Reset the server's compression context after each message (lower ratio). The `zlib` streams stay allocated. */
  serverNoContextTakeover?: boolean;
  /** Ask the client not to reuse its compression context across messages. */
  clientNoContextTakeover?: boolean;
  /** LZ77 window size (8–15) the server compresses with. Smaller windows use less memory. */
  serverMaxWindowBits?: number;
  /** LZ77 window size (8–15) the client is asked to compress with. */
  clientMaxWindowBits?: number;
  /** Options for the `zlib` deflate stream (e.g. `{ level: 3 }`). */
  zlibDeflateOptions?: {
    level?: number;
    memLevel?: number;
    strategy?: number;
    chunkSize?: number;
    windowBits?: number;
  };
  /** Options for the `zlib` inflate stream. */
  zlibInflateOptions?: {
    chunkSize?: number;
    windowBits?: number;
  };
  /**
   * Payloads smaller than this many bytes are sent uncompressed (`ws` default:
   * `1024`). Only applied with `serverNoContextTakeover: true`; with context
   * takeover (the default) every message is compressed regardless of size.
   */
  threshold?: number;
}
interface Hooks {
  /**
   * Upgrading a request to a WebSocket connection.
   *
   * - You can throw a Response to abort the upgrade.
   * - You can return { headers } to modify the response.
   * - You can return { protocol } to accept a WebSocket subprotocol for this
   *   connection (echoed back as `Sec-WebSocket-Protocol`). This is the
   *   per-connection counterpart to the global
   *   {@link AdapterOptions.handleProtocols} option and takes precedence over
   *   it. It should be one of the subprotocols the client offered (the values
   *   in the request's `Sec-WebSocket-Protocol` header).
   * - You can return { perMessageDeflate } to accept (`true` or an options
   *   object) or refuse (`false`) `permessage-deflate` compression for this
   *   connection, overriding the adapter's default. Only honored by the Node.js
   *   adapter; other runtimes configure compression server-wide, if at all.
   * - You can return { namespace } to change the pub/sub namespace.
   * - You can return { context } to provide a custom peer context.
   * - You can return { handled: true } to signal that the upgrade has
   *   already been performed by the hook (e.g. delegated to an external
   *   node-style `(req, socket, head)` handler). The adapter will then
   *   leave the socket alone and skip its own upgrade.
   *
   * @param request
   * @throws {Response}
   */
  upgrade: (request: Request & {
    readonly context?: Record<string, unknown>;
  }) => MaybePromise<{
    headers?: HeadersInit;
    protocol?: string;
    perMessageDeflate?: boolean | PerMessageDeflateOptions;
    namespace?: string;
    context?: PeerContext$1;
    handled?: boolean;
  } | Response | void>;
  /** A message is received */
  message: (peer: Peer, message: Message) => MaybePromise<void>;
  /** A socket is opened */
  open: (peer: Peer) => MaybePromise<void>;
  /** A socket is closed */
  close: (peer: Peer, details: {
    code?: number;
    reason?: string;
  }) => MaybePromise<void>;
  /**
   * The send buffer has drained after backpressure, so it is safe to resume
   * sending. Pair with {@link Peer.bufferedAmount} to throttle senders.
   *
   * **Note:** Only emitted by adapters that expose a drain signal. Refer to the
   * [compatibility table](https://crossws.h3.dev/guide/peer#compatibility).
   */
  drain: (peer: Peer) => MaybePromise<void>;
  /** An error occurs */
  error: (peer: Peer, error: WSError) => MaybePromise<void>;
  /**
   * An application-level WebSocket ping control frame was received from the
   * peer (e.g. sent by the client, or by another server via
   * {@link Peer.ping}).
   *
   * **Note:** Only emitted by adapters that surface inbound ping frames.
   * Refer to the [compatibility table](https://crossws.h3.dev/guide/peer#compatibility).
   */
  ping: (peer: Peer, data: Uint8Array) => MaybePromise<void>;
  /**
   * An application-level WebSocket pong control frame was received from the
   * peer, typically in reply to {@link Peer.ping}. Use together with a
   * timestamp embedded in the ping payload to measure round-trip latency.
   *
   * **Note:** Only emitted by adapters that surface inbound pong frames.
   * Refer to the [compatibility table](https://crossws.h3.dev/guide/peer#compatibility).
   */
  pong: (peer: Peer, data: Uint8Array) => MaybePromise<void>;
}
declare const wsConnectedEvent: Eventa<{
  id: string;
}, undefined, undefined>;
declare const wsDisconnectedEvent: Eventa<{
  id: string;
}, undefined, undefined>;
declare const wsErrorEvent: Eventa<{
  error: unknown;
}, undefined, undefined>;
/** Creates one Eventa Context shared by all connected H3 WebSocket peers. */
interface H3GlobalAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
export declare function createGlobalContext(options?: H3GlobalAdapterOptions): {
  websocketHandlers: Omit<Hooks, 'upgrade'>;
  context: EventContext<undefined, {
    raw: {
      error?: WSError;
      message?: Message;
    };
  }>;
};
declare const wsConnectedEvent$1: Eventa<{
  id: string;
}, undefined, undefined>;
declare const wsDisconnectedEvent$1: Eventa<{
  id: string;
}, undefined, undefined>;
declare const wsErrorEvent$1: Eventa<{
  error: unknown;
}, undefined, undefined>;
/** Creates an Eventa Context for one H3 WebSocket peer. */
interface H3PeerAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
}
export declare function createPeerContext(peer: Peer, options?: H3PeerAdapterOptions): {
  hooks: Pick<Hooks, 'message' | 'close' | 'error'>;
  context: EventContext<undefined, {
    raw: {
      message: Message;
    };
  }>;
};
interface PeerContext {
  peer: Peer;
  context: EventContext<undefined, {
    raw: {
      message: Message;
    };
  }>;
}
export declare function createPeerHooks(options?: H3PeerAdapterOptions): {
  hooks: Partial<Hooks>;
  untilLeastOneConnected: Promise<PeerContext>;
};
export { type H3GlobalAdapterOptions, type H3PeerAdapterOptions, type PeerContext, wsErrorEvent as global, wsConnectedEvent as globalWsConnectedEvent, wsDisconnectedEvent as globalWsDisconnectedEvent, wsConnectedEvent$1 as peerWsConnectedEvent, wsDisconnectedEvent$1 as peerWsDisconnectedEvent, wsErrorEvent$1 as peerWsErrorEvent };
//# sourceMappingURL=index.d.mts.map