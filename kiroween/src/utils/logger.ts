/**
 * Logging utility that respects environment settings
 * Logs are only shown in development mode to reduce console noise in production
 * Error logs are always shown as they're critical for debugging production issues
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Creates a logger instance that respects environment settings
 */
const createLogger = (): Logger => {
  return {
    /**
     * Logs informational messages (development only)
     */
    log: (...args: unknown[]) => {
      if (isDevelopment) {
        console.log(...args);
      }
    },

    /**
     * Logs warning messages (development only)
     */
    warn: (...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(...args);
      }
    },

    /**
     * Logs error messages (always shown, critical for debugging)
     */
    error: (...args: unknown[]) => {
      console.error(...args);
      
      // In production, you might want to send errors to an error tracking service
      // Example: Sentry.captureException(error)
      if (isProduction) {
        // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
        // errorReportingService.captureError(args);
      }
    },

    /**
     * Logs debug messages (development only)
     */
    debug: (...args: unknown[]) => {
      if (isDevelopment) {
        console.debug(...args);
      }
    },

    /**
     * Logs info messages (development only)
     */
    info: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(...args);
      }
    },
  };
};

/**
 * Default logger instance
 * Import this in your files instead of using console directly
 * 
 * @example
 * import { logger } from '@/utils/logger';
 * logger.log('This will only show in development');
 * logger.error('This will always show');
 */
export const logger = createLogger();

/**
 * Create a scoped logger with a prefix
 * Useful for debugging specific modules or features
 * 
 * @example
 * const ghostWriterLogger = createScopedLogger('[Ghost Writer]');
 * ghostWriterLogger.log('Component mounted');
 */
export const createScopedLogger = (prefix: string): Logger => {
  return {
    log: (...args: unknown[]) => {
      if (isDevelopment) {
        console.log(prefix, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    },
    debug: (...args: unknown[]) => {
      if (isDevelopment) {
        console.debug(prefix, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(prefix, ...args);
      }
    },
  };
};

export default logger;

