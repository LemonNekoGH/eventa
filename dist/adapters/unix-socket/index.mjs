import { _ as matchBy, m as defineEventa, o as createContext$1, p as and } from "../../invoke-shared-BgaCcbG9.mjs";
import { t as toError } from "../../errors-lhMLEhFT.mjs";
import { n as createOutboundInner, r as restoreInner } from "../../internal-BK_9UiZq.mjs";
import { Buffer } from "node:buffer";
import { EventEmitter } from "node:events";
import { createConnection, createServer as createServer$1 } from "node:net";
// src/adapters/unix-socket/index.ts
const DEFAULT_MAX_FRAME_BYTES = 1048576;
const unixSocketDisconnectedEvent = defineEventa();
const unixSocketErrorEvent = defineEventa();
var FramedSocket = class extends EventEmitter {
	socket;
	maxFrameBytes;
	#buffer = Buffer.alloc(0);
	#closed = false;
	constructor(socket, maxFrameBytes) {
		super();
		this.socket = socket;
		this.maxFrameBytes = maxFrameBytes;
		socket.on("data", (chunk) => this.receive(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
		socket.on("error", (error) => {
			if (this.listenerCount("error") > 0) super.emit("error", error);
		});
		socket.on("close", (hadError) => {
			this.#closed = true;
			super.emit("close", hadError);
		});
	}
	send(frame) {
		if (this.#closed || this.socket.destroyed) return false;
		const encoded = Buffer.from(`${JSON.stringify(frame)}\n`);
		if (encoded.byteLength > this.maxFrameBytes) {
			this.socket.destroy(/* @__PURE__ */ new Error(`Eventa Unix socket frame exceeds ${this.maxFrameBytes} bytes`));
			return false;
		}
		return this.socket.write(encoded);
	}
	close() {
		if (!this.#closed && !this.socket.destroyed) this.socket.end();
	}
	receive(chunk) {
		this.#buffer = Buffer.concat([this.#buffer, chunk]);
		if (this.#buffer.byteLength > this.maxFrameBytes * 2) {
			this.socket.destroy(/* @__PURE__ */ new Error(`Eventa Unix socket buffer exceeds ${this.maxFrameBytes * 2} bytes`));
			return;
		}
		let delimiter = this.#buffer.indexOf(10);
		while (delimiter >= 0) {
			const rawFrame = this.#buffer.subarray(0, delimiter);
			this.#buffer = this.#buffer.subarray(delimiter + 1);
			delimiter = this.#buffer.indexOf(10);
			if (rawFrame.byteLength === 0) continue;
			if (rawFrame.byteLength > this.maxFrameBytes) {
				this.socket.destroy(/* @__PURE__ */ new Error(`Eventa Unix socket frame exceeds ${this.maxFrameBytes} bytes`));
				return;
			}
			try {
				super.emit("message", JSON.parse(rawFrame.toString("utf8")));
			} catch (error) {
				this.socket.destroy(toError(error, "eventa: invalid Unix socket frame"));
				return;
			}
		}
	}
};
function resolveMaxFrameBytes(value) {
	const maxFrameBytes = value ?? DEFAULT_MAX_FRAME_BYTES;
	if (!Number.isSafeInteger(maxFrameBytes) || maxFrameBytes < 1) throw new RangeError("maxFrameBytes must be a positive safe integer.");
	return maxFrameBytes;
}
/** Creates an Eventa Context backed by a connected Node.js Unix socket. */
function createContext(socket, options = {}) {
	const ctx = createContext$1(options.context);
	const framedSocket = new FramedSocket(socket, resolveMaxFrameBytes(options.maxFrameBytes));
	let disposed = false;
	let dispose;
	const stopSending = ctx.on(and(matchBy((event) => !("_flowDirection" in event) || !event._flowDirection || event._flowDirection === "outbound"), matchBy("*")), (event) => {
		const inner = createOutboundInner(event);
		if (inner && !framedSocket.send(inner)) dispose(/* @__PURE__ */ new Error("eventa: invoke cancelled, Unix socket disconnected"), false);
	});
	dispose = (reason, closeSocket = true) => {
		if (disposed) return;
		disposed = true;
		stopSending();
		ctx.abort(reason ?? /* @__PURE__ */ new Error("eventa: invoke cancelled, Unix socket adapter disposed"));
		if (closeSocket) framedSocket.close();
	};
	framedSocket.on("message", (message) => {
		try {
			const inner = restoreInner(message);
			ctx.emit(inner.eventa, inner.eventa.body, { raw: { message } }).catch((emitError) => console.error("Failed to emit Unix socket message:", emitError));
		} catch (error) {
			ctx.emit(unixSocketErrorEvent, { error: toError(error, "eventa: Unix socket message parse error") }, { raw: { message } }).catch((emitError) => console.error("Failed to emit Unix socket parse error:", emitError));
		}
	});
	framedSocket.on("error", (error) => {
		const normalized = toError(error, "eventa: Unix socket error");
		dispose(normalized, false);
		ctx.emit(unixSocketErrorEvent, { error: normalized }, { raw: { error: normalized } }).catch((emitError) => console.error("Failed to emit Unix socket error:", emitError));
	});
	framedSocket.on("close", (hadError) => {
		dispose(/* @__PURE__ */ new Error("eventa: invoke cancelled, Unix socket disconnected"), false);
		ctx.emit(unixSocketDisconnectedEvent, { hadError }, { raw: { hadError } }).catch((emitError) => console.error("Failed to emit Unix socket disconnect:", emitError));
	});
	return {
		context: ctx,
		dispose
	};
}
/** Connects to a Unix socket and creates an Eventa context for it. */
async function connect(path, options) {
	const socket = createConnection({ path });
	await new Promise((resolve, reject) => {
		let onConnect;
		let onError;
		const cleanup = () => {
			socket.off("connect", onConnect);
			socket.off("error", onError);
		};
		onConnect = () => {
			cleanup();
			resolve();
		};
		onError = (error) => {
			cleanup();
			reject(error);
		};
		socket.once("connect", onConnect);
		socket.once("error", onError);
	});
	return createContext(socket, options);
}
/** Listens on a Unix socket and creates one Eventa context for every client. */
async function createServer(path, onConnection, options) {
	const connections = /* @__PURE__ */ new Set();
	const server = createServer$1((socket) => {
		const connection = createContext(socket, options);
		connections.add(connection);
		socket.once("close", () => connections.delete(connection));
		try {
			onConnection(connection);
		} catch (error) {
			connection.dispose(error);
		}
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(path, () => {
			server.off("error", reject);
			resolve();
		});
	});
	return { close: async () => {
		for (const connection of connections) connection.dispose();
		await new Promise((resolve, reject) => {
			server.close((error) => error ? reject(error) : resolve());
		});
	} };
}
export { connect, createContext, createServer, unixSocketDisconnectedEvent, unixSocketErrorEvent };

//# sourceMappingURL=index.mjs.map