const winston = require('winston');

// Reset Console transport and configure it to include ISO timestamp.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
	timestamp: true,
});

const logExt = '.log';

/**
 * Wrapper around Winston
 */
export class Logger {
	static getLevel() {
		return winston.level || process.env.LOG_LEVEL || 'debug';
	}

	static setLevel(level: string) {
		winston.level = level;
	}

	/*
    Medium priority logging, default.
  */
	static log(...messages: any) {
		winston.log('info', ...messages);
	}

	/*
    Appends red "ERROR" to the start of logs.
    Highest priority logging.
  */
	static error(...messages: any) {
		winston.log('error', ...messages);
	}

	/*
    Less high priority than error, still higher visibility than default.
  */
	static warn(...messages: any) {
		winston.log('warn', ...messages);
	}

	/*
    Lower priority logging.
    Only logs if the environment variable is set to VERBOSE.
  */
	static verbose(...messages: any) {
		winston.log('verbose', ...messages);
	}

	//TODO: Be able to set and deactivate file logging via a server command.
	static setFileLogging(path: string) {
		if (!path.endsWith(logExt)) {
			path += logExt;
		}
		console.log('Adding file logging at ' + path);
		winston.add(winston.transports.File, { filename: path, timestamp: true });
	}

	static deactivateFileLogging() {
		winston.remove(winston.transports.File);
	}

	static enablePrettyErrors() {
		const pe = require('pretty-error').start();
		pe.skipNodeFiles(); // Ignore native node files in stacktrace.
	}

	static get _winston () { return winston; }
}
