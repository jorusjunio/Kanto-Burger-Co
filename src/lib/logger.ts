type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

/** Normalize an unknown error into a serializable shape for structured logs. */
function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  if (error === undefined) {
    return undefined;
  }

  return { value: error };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  /** Human-readable line used in local development. */
  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Single-line structured JSON used in production. Vercel captures stdout/
   * stderr and parses JSON into queryable fields, so a Log Drain can forward
   * these to Datadog / Axiom / Better Stack with no code changes.
   */
  private formatJson(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
  ) {
    return JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    });
  }

  info(message: string, context?: LogContext) {
    if (!this.isDevelopment) {
      console.log(this.formatJson("info", message, context));
      return;
    }
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext) {
    if (!this.isDevelopment) {
      console.warn(this.formatJson("warn", message, context));
      return;
    }
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!this.isDevelopment) {
      console.error(this.formatJson("error", message, context, error));
      return;
    }
    console.error(this.formatMessage("error", message, context), error);
  }

  debug(message: string, context?: LogContext) {
    // Debug output stays development-only in both environments.
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();
