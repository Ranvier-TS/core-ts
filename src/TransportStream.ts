import { EventEmitter } from "events";

/**
 * Base class for anything that should be sending or receiving data from the player
 */
export class TransportStream extends EventEmitter {
  socket?: object;

  get readable() {
    return true;
  }

  get writable() {
    return true;
  }

  write() {
    /* noop */
  }

  /**
   * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
   * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
   * @param {string} command
   * @param {...*} args
   * @return {*}
   */
  command(command: string, ...args: any[]) {
    if (!command || !command.length) {
      throw new RangeError("Must specify a command to the stream");
    }
    command = "execute" + command[0].toUpperCase() + command.substr(1);
    if (typeof this[command] === "function") {
      return this[command](...args);
    }
  }

  address() {
    return null;
  }

  end() {
    /* noop */
  }

  setEncoding() {
    /* noop */
  }

  pause() {
    /* noop */
  }

  resume() {
    /* noop */
  }

  destroy() {
    /* noop */
  }

  /**
   * Attach a socket to this stream
   * @param {*} socket
   */
  attach(socket: object) {
    this.socket = socket;

    this.socket.on("close", (_?: any) => {
      this.emit("close");
    });
  }
}
