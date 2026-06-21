import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  CORS_ORIGIN: z.string().default("*"),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  ENABLE_HTTPS_REDIRECT: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  ENABLE_REQUEST_LOGGING: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  ENABLE_COMPRESSION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  ENABLE_DEBUG_REQUEST_LOG: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  BODY_LIMIT: z.string().default("10kb"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

if (env.NODE_ENV === "production" && env.CORS_ORIGIN === "*") {
  console.warn(
    "Warning: CORS_ORIGIN is set to '*' in production. Set explicit origins.",
  );
}
