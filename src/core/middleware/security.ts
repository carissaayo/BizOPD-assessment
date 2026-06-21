import compression from "compression";
import cors from "cors";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { env } from "../../config/env";
import { securityConfig } from "../../config/security";

const httpsRedirect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (
    !securityConfig.httpsRedirect.enabled ||
    env.NODE_ENV !== "production"
  ) {
    next();
    return;
  }

  if (req.headers["x-forwarded-proto"] === "https") {
    next();
    return;
  }

  const host = req.headers.host;
  if (!host) {
    next();
    return;
  }

  res.redirect(301, `https://${host}${req.originalUrl}`);
};

const helmetMiddleware = helmet(securityConfig.helmet.options);
const corsMiddleware = cors(securityConfig.cors.options);
const hppMiddleware = hpp(securityConfig.hpp.options);
const limiter = rateLimit(securityConfig.rateLimit.options);
const compressionMiddleware = compression(securityConfig.compression.options);
const mongoSanitizeMiddleware = mongoSanitize(
  securityConfig.mongoSanitize.options,
);

const bodyParsers: express.RequestHandler[] = [];

if (securityConfig.bodyParsers.enabled) {
  bodyParsers.push(
    express.json({
      limit: securityConfig.bodyParsers.jsonLimit,
      strict: true,
    }),
  );

  if (securityConfig.bodyParsers.urlencoded.enabled) {
    bodyParsers.push(
      express.urlencoded({
        extended: securityConfig.bodyParsers.urlencoded.extended,
        limit: securityConfig.bodyParsers.urlencoded.limit,
      }),
    );
  }
}

export function setupSecurityMiddleware(app: Application): void {
  app.disable("x-powered-by");

  if (securityConfig.trustProxy) {
    app.set("trust proxy", 1);
  }

  if (securityConfig.logging.enabled) {
    app.use(
      pinoHttp({
        autoLogging: {
          ignore: (req) => req.url === "/health",
        },
        redact: {
          paths: [
            "req.headers.authorization",
            "req.body.password",
            "req.body.phone",
          ],
          remove: true,
        },
      }),
    );
  }

  if (securityConfig.httpsRedirect.enabled) {
    app.use(httpsRedirect);
  }

  if (securityConfig.helmet.enabled) {
    app.use(helmetMiddleware);
  }

  if (securityConfig.cors.enabled) {
    app.use(corsMiddleware);
  }

  if (securityConfig.rateLimit.enabled) {
    app.use(limiter);
  }

  if (securityConfig.compression.enabled) {
    app.use(compressionMiddleware);
  }

  if (securityConfig.bodyParsers.enabled) {
    for (const parser of bodyParsers) {
      app.use(parser);
    }
  }

  if (securityConfig.mongoSanitize.enabled) {
    app.use(mongoSanitizeMiddleware);
  }

  if (securityConfig.hpp.enabled) {
    app.use(hppMiddleware);
  }

  if (securityConfig.debug.enabled && securityConfig.debug.logRequests) {
    app.use((req: Request, _res: Response, next: NextFunction): void => {
      console.log(`[${req.method}] ${req.path}`, {
        query: req.query,
        params: req.params,
      });
      next();
    });
  }
}
