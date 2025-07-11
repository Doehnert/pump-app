// Environment configuration for the Pump Master application

export interface EnvironmentConfig {
  apiUrl: string;
  appName: string;
  debug: boolean;
  enableAnalytics: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Development environment
  if (import.meta.env.DEV) {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5073",
      appName: "Pump Master (Dev)",
      debug: true,
      enableAnalytics: false,
    };
  }

  // Production environment
  if (import.meta.env.PROD) {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "https://api.informag.com.au",
      appName: "Pump Master",
      debug: false,
      enableAnalytics: true,
    };
  }

  // Test environment
  if (import.meta.env.MODE === "test") {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5073",
      appName: "Pump Master (Test)",
      debug: true,
      enableAnalytics: false,
    };
  }

  // Fallback configuration
  return {
    apiUrl: "http://localhost:5073",
    appName: "Pump Master",
    debug: false,
    enableAnalytics: false,
  };
};

export const config = getEnvironmentConfig();

// Helper functions
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;
export const isTest = () => import.meta.env.MODE === "test";

// API URL helpers
export const getApiUrl = (endpoint: string = "") => {
  const baseUrl = config.apiUrl.replace(/\/$/, ""); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ""); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Logging helper
export const log = (message: string, data?: any) => {
  if (config.debug) {
    console.log(`[${config.appName}] ${message}`, data || "");
  }
};
