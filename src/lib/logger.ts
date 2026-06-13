type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(this.formatMessage("error", message, context), error);
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();
