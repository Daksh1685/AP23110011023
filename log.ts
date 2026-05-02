// Enum definitions for type-safe logging
enum LogStack {
  FRONTEND = "frontend"
}

enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal"
}

enum PackageName {
  API = "api",
  COMPONENT = "component",
  HOOK = "hook",
  PAGE = "page",
  STATE = "state",
  STYLE = "style",
  AUTH = "auth",
  CONFIG = "config",
  MIDDLEWARE = "middleware",
  UTILS = "utils"
}

// Type definitions
interface LogRequest {
  stack: LogStack;
  level: LogLevel;
  packageName: PackageName;
  message: string;
  timestamp?: string;
}

interface LogResponse {
  logId: string;
  status: string;
  timestamp: string;
}

interface LoggerConfig {
  bearerToken: string;
  apiEndpoint?: string;
  timeout?: number;
}

class LoggerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoggerError";
  }
}

// Logger configuration management
class LoggerManager {
  private static instance: LoggerManager;
  private config: LoggerConfig;
  private readonly DEFAULT_ENDPOINT = "http://20.207.122.201/evaluation-service/logs";
  private readonly DEFAULT_TIMEOUT = 5000;

  private constructor(config: LoggerConfig) {
    if (!config.bearerToken) {
      throw new LoggerError("Bearer token is required");
    }
    this.config = {
      apiEndpoint: config.apiEndpoint || this.DEFAULT_ENDPOINT,
      timeout: config.timeout || this.DEFAULT_TIMEOUT,
      bearerToken: config.bearerToken
    };
  }

  static initialize(config: LoggerConfig): LoggerManager {
    if (!LoggerManager.instance) {
      LoggerManager.instance = new LoggerManager(config);
    }
    return LoggerManager.instance;
  }

  static getInstance(): LoggerManager {
    if (!LoggerManager.instance) {
      throw new LoggerError("Logger not initialized. Call LoggerManager.initialize() first");
    }
    return LoggerManager.instance;
  }

  getConfig(): LoggerConfig {
    return this.config;
  }

  updateToken(token: string): void {
    this.config.bearerToken = token;
  }
}

// Utility function to validate enum values
function isValidLogStack(value: string): value is LogStack {
  return Object.values(LogStack).includes(value as LogStack);
}

function isValidLogLevel(value: string): value is LogLevel {
  return Object.values(LogLevel).includes(value as LogLevel);
}

function isValidPackageName(value: string): value is PackageName {
  return Object.values(PackageName).includes(value as PackageName);
}

// Main logging function
async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
): Promise<string> {
  // Validate stack
  if (!isValidLogStack(stack)) {
    throw new LoggerError(`Invalid stack value: "${stack}". Must be "frontend"`);
  }

  // Validate level
  if (!isValidLogLevel(level)) {
    throw new LoggerError(
      `Invalid level value: "${level}". Must be one of: ${Object.values(LogLevel).join(", ")}`
    );
  }

  // Validate packageName
  if (!isValidPackageName(packageName)) {
    throw new LoggerError(
      `Invalid packageName value: "${packageName}". Must be one of: ${Object.values(PackageName).join(", ")}`
    );
  }

  // Validate message
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new LoggerError("Message must be a non-empty string");
  }

  try {
    const logger = LoggerManager.getInstance();
    const config = logger.getConfig();

    const logPayload: LogRequest = {
      stack,
      level,
      packageName,
      message,
      timestamp: new Date().toISOString()
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(config.apiEndpoint!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.bearerToken}`
      },
      body: JSON.stringify(logPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.text();
      throw new LoggerError(
        `API returned status ${response.status}: ${errorData || response.statusText}`
      );
    }

    // Parse and return response
    const data = (await response.json()) as LogResponse;

    if (!data.logId) {
      throw new LoggerError("No logId returned from server");
    }

    return data.logId;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new LoggerError("Network error: Unable to reach logging service");
    }

    // Handle abort errors
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LoggerError(`Request timeout after ${LoggerManager.getInstance().getConfig().timeout}ms`);
    }

    // Re-throw LoggerError as-is
    if (error instanceof LoggerError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new LoggerError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export all public items
export { Log, LoggerManager, LogStack, LogLevel, PackageName, LoggerError };
export type { LogRequest, LogResponse, LoggerConfig };
