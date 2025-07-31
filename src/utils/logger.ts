export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  operationId?: string;
  userId?: string;
  userIdRaw?: string;
  [key: string]: any;
}

class CustomLogger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage("DEBUG", message, context);
      if (this.isDevelopment) {
        console.debug(formattedMessage);
      }
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage("INFO", message, context);
      console.info(formattedMessage);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage("WARN", message, context);
      console.warn(formattedMessage);
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorStr = error
        ? ` | Error: ${error instanceof Error ? error.message : String(error)}`
        : "";
      const formattedMessage = this.formatMessage(
        "ERROR",
        message + errorStr,
        context
      );
      console.error(formattedMessage);

      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  pool(message: string, context?: LogContext): void {
    this.info(`[POOL] ${message}`, context);
  }

  recommendation(message: string, context?: LogContext): void {
    this.info(`[RECOMMENDATION] ${message}`, context);
  }

  operation(message: string, context?: LogContext): void {
    this.info(`[OPERATION] ${message}`, context);
  }

  user(message: string, context?: LogContext): void {
    this.info(`[USER] ${message}`, context);
  }

  llm(message: string, context?: LogContext): void {
    this.info(`[LLM] ${message}`, context);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

const defaultLogger = new CustomLogger(
  process.env.LOG_LEVEL === "DEBUG" ? LogLevel.DEBUG : LogLevel.INFO
);

export const logger = defaultLogger;

export const createLogger = (logLevel?: LogLevel): CustomLogger => {
  return new CustomLogger(logLevel);
};
