export type LogCategory = 'api' | 'ui' | 'error' | 'interaction';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, unknown>;
}

const LOGGER_URL = import.meta.env.VITE_LOGGER_URL ?? '';
const LOGGER_ENABLED = Boolean(LOGGER_URL);

const formatMessage = (payload: LogPayload): string => {
  const details = payload.details ? ` | details=${JSON.stringify(payload.details)}` : '';
  return `[${payload.timestamp}] [${payload.level}] [${payload.category}] ${payload.message}${details}`;
};

const sendRemoteLog = async (payload: LogPayload): Promise<void> => {
  if (!LOGGER_ENABLED) {
    return;
  }

  try {
    await fetch(LOGGER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Logger failed to send remote log', error);
  }
};

const log = async (level: LogLevel, category: LogCategory, message: string, details?: Record<string, unknown>) => {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details
  };

  const formatted = formatMessage(payload);

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
    default:
      console.log(formatted);
  }

  void sendRemoteLog(payload);
};

export const logger = {
  debug: (category: LogCategory, message: string, details?: Record<string, unknown>) => log(LogLevel.DEBUG, category, message, details),
  info: (category: LogCategory, message: string, details?: Record<string, unknown>) => log(LogLevel.INFO, category, message, details),
  warn: (category: LogCategory, message: string, details?: Record<string, unknown>) => log(LogLevel.WARN, category, message, details),
  error: (category: LogCategory, message: string, details?: Record<string, unknown>) => log(LogLevel.ERROR, category, message, details)
};
