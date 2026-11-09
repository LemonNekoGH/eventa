import { n as EventContext, t as CreateContextOptions } from "../../context-BCSkPp2Y.mjs";
import { t as errorEvent } from "../../shared-CKJg74Hd.mjs";
import { BrowserWindow, IpcMain, IpcMainEvent, WebContents } from "electron";
/** Creates an Eventa Context backed by Electron main-process IPC. */
export interface ElectronMainAdapterOptions {
  /** Delivery deduplication and hop policy for the created Context. */
  context?: CreateContextOptions;
  /**
   * Accepts IPC messages only from the bound window and sends only to that window.
   * Includes error messages and extra listeners. Requires a live BrowserWindow.
   * Closing the window disposes the adapter and rejects pending calls.
   * @default false
   */
  onlySameWindow?: boolean;
  /**
   * Optional predicate that validates every incoming IPC event before parsing
   * or dispatch (e.g. verifying `event.senderFrame === event.sender.mainFrame`
   * and checking the sender URL).
   */
  allowSender?: (event: IpcMainEvent) => boolean;
  /**
   * Optional fallback targets used when the main process emits an outbound
   * event without a bound `window` and without an inbound `raw.ipcMainEvent`
   * (for example, broadcasting state changes to all registered windows).
   */
  targets?: () => Iterable<WebContents | BrowserWindow>;
  /** IPC channel carrying Eventa inner values, or `false` to disable it. @default 'eventa-message' */
  messageEventName?: string | false;
  /** IPC channel dispatched as adapter errors, or `false` to disable it. @default 'eventa-error' */
  errorEventName?: string | false;
  /** Additional IPC listeners removed when the adapter is disposed. @default {} */
  extraListeners?: Record<string, (ipcMainEvent: IpcMainEvent, event: Event) => void | Promise<void>>;
  /** Reserved send-failure policy option. @default false */
  throwIfFailedToSend?: boolean;
}
/** Raw main-process IPC metadata exposed to Eventa listeners. */
export interface ElectronMainEmitOptions {
  raw?: {
    ipcMainEvent?: IpcMainEvent;
    event?: Event | unknown;
    targetWebContents?: WebContents | Iterable<WebContents | BrowserWindow>;
  };
}
/** Invoke metadata made available by the Electron main-process context. */
export interface ElectronMainContextExtensions {
  invokeRequest?: {
    raw?: ElectronMainEmitOptions['raw'];
  };
}
/**
 * Binds a context to Electron IPC. A supplied window selects the send target.
 * Enable `onlySameWindow` to restrict incoming IPC and tie disposal to window closure.
 * Otherwise, the caller must dispose the adapter when its owner stops.
 */
export declare function createContext(ipcMain: IpcMain, window?: BrowserWindow, options?: ElectronMainAdapterOptions): {
  context: EventContext<ElectronMainContextExtensions, ElectronMainEmitOptions>;
  dispose: (reason?: unknown) => void;
};
export type { errorEvent };
//# sourceMappingURL=main.d.mts.map