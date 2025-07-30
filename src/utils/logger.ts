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

  // Convenience method for pool-related logging
  pool(message: string, context?: LogContext): void {
    this.info(`[POOL] ${message}`, context);
  }

  // Convenience method for recommendation-related logging
  recommendation(message: string, context?: LogContext): void {
    this.info(`[RECOMMENDATION] ${message}`, context);
  }

  // Convenience method for operation-related logging
  operation(message: string, context?: LogContext): void {
    this.info(`[OPERATION] ${message}`, context);
  }

  // Convenience method for user-related logging
  user(message: string, context?: LogContext): void {
    this.info(`[USER] ${message}`, context);
  }

  // Convenience method for LLM-related logging
  llm(message: string, context?: LogContext): void {
    this.info(`[LLM] ${message}`, context);
  }

  // Method to set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Method to get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Create default logger instance
const defaultLogger = new CustomLogger(
  process.env.LOG_LEVEL === "DEBUG" ? LogLevel.DEBUG : LogLevel.INFO
);

// Export the logger instance and LogLevel enum
export const logger = defaultLogger;

// Export a function to create a new logger instance
export const createLogger = (logLevel?: LogLevel): CustomLogger => {
  return new CustomLogger(logLevel);
};
