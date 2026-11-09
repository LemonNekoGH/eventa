import { n as EventContext, t as CreateContextOptions, u as Eventa } from "../../context-BCSkPp2Y.mjs";
import { Socket } from "node:net";
export declare const unixSocketDisconnectedEvent: Eventa<{
  hadError: boolean;
}, undefined, undefined>;
export declare const unixSocketErrorEvent: Eventa<{
  error: Error;
}, undefined, undefined>;
/** Options for the Node.js Unix-domain-socket adapter. */
export interface UnixSocketAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /** Largest accepted JSON frame in bytes. @default 1048576 */
  maxFrameBytes?: number;
}
/** Raw socket metadata available to Eventa listeners. */
export interface UnixSocketEmitOptions {
  raw: {
    message?: unknown;
    error?: Error;
    hadError?: boolean;
  };
}
/** A context bound to one connected Unix socket. */
export interface UnixSocketConnection {
  context: EventContext<undefined, UnixSocketEmitOptions>;
  /** Aborts pending invokes and closes the owned socket. */
  dispose: (reason?: unknown) => void;
}
/** A listening Unix socket server and every context it owns. */
export interface UnixSocketServer {
  close: () => Promise<void>;
}
/** Creates an Eventa Context backed by a connected Node.js Unix socket. */
export declare function createContext(socket: Socket, options?: UnixSocketAdapterOptions): UnixSocketConnection;
/** Connects to a Unix socket and creates an Eventa context for it. */
export declare function connect(path: string, options?: UnixSocketAdapterOptions): Promise<UnixSocketConnection>;
/** Listens on a Unix socket and creates one Eventa context for every client. */
export declare function createServer(path: string, onConnection: (connection: UnixSocketConnection) => void, options?: UnixSocketAdapterOptions): Promise<UnixSocketServer>;
//# sourceMappingURL=index.d.mts.map