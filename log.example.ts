import { Log, LoggerManager, LoggerError } from "./log";

// ============================================================================
// INITIALIZATION EXAMPLE
// ============================================================================

// Step 1: Initialize the logger with your bearer token
// This should be done once at application startup (e.g., in main.ts or App.tsx)

const initializeLogger = () => {
  try {
    LoggerManager.initialize({
      bearerToken: "your-bearer-token-here", // Get from environment variable in production
      apiEndpoint: "http://20.207.122.201/evaluation-service/logs", // Optional: custom endpoint
      timeout: 5000 // Optional: custom timeout in ms
    });
    console.log("Logger initialized successfully");
  } catch (error) {
    console.error("Failed to initialize logger:", error);
  }
};

// ============================================================================
// USAGE EXAMPLES IN DIFFERENT CONTEXTS
// ============================================================================

// Example 1: Logging from a React Component
const ComponentExample = async () => {
  try {
    // Simulate some component operation
    const data = await fetch("/api/users");

    // Log successful operation
    const logId = await Log(
      "frontend",
      "info",
      "component",
      "UserList component rendered successfully"
    );
    console.log(`Log recorded with ID: ${logId}`);
  } catch (error) {
    // Log error
    try {
      const logId = await Log(
        "frontend",
        "error",
        "component",
        `UserList component error: ${error instanceof Error ? error.message : String(error)}`
      );
      console.log(`Error logged with ID: ${logId}`);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }
};

// Example 2: Logging from a Custom Hook
const HookExample = async () => {
  try {
    // Simulating a custom hook that fetches data
    const userId = 123;
    const response = await fetch(`/api/users/${userId}`);

    if (response.ok) {
      const logId = await Log(
        "frontend",
        "debug",
        "hook",
        `useUserData hook executed for user ID: ${userId}`
      );
      console.log(`Hook log recorded: ${logId}`);
    }
  } catch (error) {
    try {
      const logId = await Log(
        "frontend",
        "warn",
        "hook",
        `useUserData hook encountered an issue: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.log(`Warning logged: ${logId}`);
    } catch (logError) {
      console.error("Logging failed:", logError);
    }
  }
};

// Example 3: Logging from API Service
class ApiService {
  static async fetchUserData(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Log successful API call
      await Log(
        "frontend",
        "info",
        "api",
        `API request successful: GET /api/users/${userId}`
      );

      return data;
    } catch (error) {
      // Log API error
      try {
        await Log(
          "frontend",
          "error",
          "api",
          `API request failed: ${error instanceof Error ? error.message : String(error)}`
        );
      } catch (logError) {
        console.error("Failed to log API error:", logError);
      }

      throw error;
    }
  }
}

// Example 4: Logging from State Management (Redux/Zustand)
const StateExample = async () => {
  try {
    // Simulating state update
    const newState = { userId: 1, username: "john_doe" };

    const logId = await Log(
      "frontend",
      "debug",
      "state",
      `State updated: ${JSON.stringify(newState)}`
    );
    console.log(`State change logged: ${logId}`);
  } catch (error) {
    console.error("Failed to log state change:", error);
  }
};

// Example 5: Logging from Authentication Module
class AuthService {
  static async login(email: string, password: string) {
    try {
      // Simulate login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { token } = await response.json();

      // Log successful login
      await Log(
        "frontend",
        "info",
        "auth",
        `User logged in successfully: ${email}`
      );

      // Update bearer token if needed
      LoggerManager.getInstance().updateToken(token);

      return token;
    } catch (error) {
      // Log authentication error
      try {
        await Log(
          "frontend",
          "warn",
          "auth",
          `Authentication attempt failed for ${email}`
        );
      } catch (logError) {
        console.error("Failed to log auth error:", logError);
      }

      throw error;
    }
  }

  static async logout() {
    try {
      await Log(
        "frontend",
        "info",
        "auth",
        "User logged out successfully"
      );
    } catch (error) {
      console.error("Failed to log logout:", error);
    }
  }
}

// Example 6: Logging from Middleware
const LoggingMiddleware = async (
  action: string,
  payload?: unknown
) => {
  try {
    const message = payload
      ? `Middleware action: ${action} with payload: ${JSON.stringify(payload)}`
      : `Middleware action: ${action}`;

    const logId = await Log(
      "frontend",
      "debug",
      "middleware",
      message
    );
    console.log(`Middleware action logged: ${logId}`);
  } catch (error) {
    console.error("Failed to log middleware action:", error);
  }
};

// Example 7: Logging from Utility Functions
class UtilLogger {
  static async logOperation(operation: string, duration: number) {
    try {
      const logId = await Log(
        "frontend",
        "info",
        "utils",
        `Operation '${operation}' completed in ${duration}ms`
      );
      return logId;
    } catch (error) {
      console.error("Failed to log operation:", error);
      return null;
    }
  }

  static async logPerformanceIssue(componentName: string, renderTime: number) {
    try {
      if (renderTime > 1000) {
        const logId = await Log(
          "frontend",
          "warn",
          "utils",
          `Performance issue: ${componentName} took ${renderTime}ms to render`
        );
        return logId;
      }
    } catch (error) {
      console.error("Failed to log performance issue:", error);
      return null;
    }
  }
}

// Example 8: Error Handling Best Practices
const ErrorHandlingExample = async () => {
  try {
    // Some operation that might fail
    throw new Error("Something went wrong");
  } catch (error) {
    try {
      // Log the error with full details
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : "No stack trace";

      const logId = await Log(
        "frontend",
        "fatal",
        "page",
        `Fatal error occurred: ${errorMessage}. Stack: ${stackTrace}`
      );

      console.error(`Error logged with ID: ${logId}`);
    } catch (logError) {
      // If logging fails, at least log to console
      if (logError instanceof LoggerError) {
        console.error("Logging service error:", logError.message);
      } else {
        console.error("Unexpected logging error:", logError);
      }
    }
  }
};

// ============================================================================
// INTEGRATION IN REACT APP (Example App.tsx)
// ============================================================================

/*
import React, { useEffect } from 'react';
import { LoggerManager } from './log';

function App() {
  useEffect(() => {
    // Initialize logger when app loads
    try {
      LoggerManager.initialize({
        bearerToken: process.env.REACT_APP_LOGGER_TOKEN || 'default-token',
      });
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}

export default App;
*/

// Export example functions for testing
export {
  initializeLogger,
  ComponentExample,
  HookExample,
  ApiService,
  StateExample,
  AuthService,
  LoggingMiddleware,
  UtilLogger,
  ErrorHandlingExample
};
