import { env } from "./env";

function parseCorsOrigins(origin: string): string | string[] {
  if (origin === "*") {
    return "*";
  }

  return origin
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export const securityConfig = {
  trustProxy: env.TRUST_PROXY,

  httpsRedirect: {
    enabled: env.ENABLE_HTTPS_REDIRECT,
  },

  logging: {
    enabled: env.ENABLE_REQUEST_LOGGING,
  },

  helmet: {
    enabled: true,
    options: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    },
  },

  cors: {
    enabled: true,
    options: {
      origin: parseCorsOrigins(env.CORS_ORIGIN),
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"] as string[],
      allowedHeaders: ["Content-Type", "Authorization"] as string[],
      credentials: env.CORS_ORIGIN !== "*",
      maxAge: 86400,
    },
  },

  rateLimit: {
    enabled: true,
    options: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: { path: string }) => req.path === "/health",
      message: {
        status: "failed",
        message: "Too many requests, please try again later",
        errorCode: "RATE_LIMIT_EXCEEDED",
      },
    },
  },

  bodyParsers: {
    enabled: true,
    jsonLimit: env.BODY_LIMIT,
    urlencoded: {
      enabled: false,
      extended: true,
      limit: env.BODY_LIMIT,
    },
  },

  hpp: {
    enabled: true,
    options: {
      checkQuery: true,
    },
  },

  mongoSanitize: {
    enabled: true,
    options: {
      replaceWith: "_",
    },
  },

  compression: {
    enabled: env.ENABLE_COMPRESSION,
    options: {
      threshold: 1024,
    },
  },

  debug: {
    enabled: env.NODE_ENV === "development",
    logRequests: env.ENABLE_DEBUG_REQUEST_LOG,
  },
};
