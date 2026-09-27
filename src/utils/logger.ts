export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export type LogCallback = (level: LogLevel, message: string, meta: unknown[]) => void;

class ConsoleLogger implements Logger {
  private level: LogLevel;
  private callback?: LogCallback;

  constructor(level: LogLevel = LogLevel.INFO, callback?: LogCallback) {
    this.level = level;
    this.callback = callback;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, message: string, meta: unknown[]): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta.length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private log(level: LogLevel, message: string, meta: unknown[]): void {
    if (this.shouldLog(level)) {
      const formatted = this.formatMessage(level, message, meta);
      
      if (this.callback) {
        this.callback(level, message, meta);
      } else {
        switch (level) {
          case LogLevel.DEBUG:
            console.debug(formatted);
            break;
          case LogLevel.INFO:
            console.info(formatted);
            break;
          case LogLevel.WARN:
            console.warn(formatted);
            break;
          case LogLevel.ERROR:
            console.error(formatted);
            break;
        }
      }
    }
  }

  debug(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.ERROR, message, meta);
  }
}

class SilentLogger implements Logger {
  private callback?: LogCallback;

  constructor(callback?: LogCallback) {
    this.callback = callback;
  }

  debug(_message: string, ..._meta: unknown[]): void {
    if (this.callback) {
      this.callback(LogLevel.DEBUG, _message, _meta);
    }
  }

  info(_message: string, ..._meta: unknown[]): void {
    if (this.callback) {
      this.callback(LogLevel.INFO, _message, _meta);
    }
  }

  warn(_message: string, ..._meta: unknown[]): void {
    if (this.callback) {
      this.callback(LogLevel.WARN, _message, _meta);
    }
  }

  error(message: string, ...meta: unknown[]): void {
    if (this.callback) {
      this.callback(LogLevel.ERROR, message, meta);
    }
  }
}

export const logger = new ConsoleLogger();

export function createLogger(level: LogLevel): Logger {
  return new ConsoleLogger(level);
}

export function createSilentLogger(callback?: LogCallback): Logger {
  return new SilentLogger(callback);
}
