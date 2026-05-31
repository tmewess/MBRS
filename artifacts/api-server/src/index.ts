import app from "./app";
import { logger } from "./lib/logger";
import { startBot } from "./bot";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] ?? "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    logger.info("Running database migrations...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bot_settings" (
        "id" serial PRIMARY KEY,
        "bot_token" text NOT NULL DEFAULT '',
        "welcome_message" text NOT NULL DEFAULT 'Добро пожаловать! Здесь вы можете купить аккаунты Telegram.',
        "support_username" text,
        "payment_yookassa_enabled" boolean NOT NULL DEFAULT false,
        "yookassa_shop_id" text,
        "yookassa_secret_key" text,
        "payment_stars_enabled" boolean NOT NULL DEFAULT false,
        "payment_crypto_enabled" boolean NOT NULL DEFAULT false,
        "crypto_bot_token" text,
        "lolz_api_key" text,
        "tg_api_id" text,
        "tg_api_hash" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" serial PRIMARY KEY,
        "phone" text,
        "country" text NOT NULL DEFAULT '',
        "phone_prefix" text,
        "dc_id" text,
        "user_id" text,
        "auth_key" text,
        "description" text,
        "status" text NOT NULL DEFAULT 'available',
        "price" double precision NOT NULL DEFAULT 0,
        "is_free" text NOT NULL DEFAULT 'false',
        "has_premium" boolean NOT NULL DEFAULT false,
        "has_password" boolean NOT NULL DEFAULT false,
        "password" text,
        "spam_block" text,
        "registration_date" text,
        "origin" text,
        "file_path" text,
        "file_name" text,
        "lolz_item_id" text,
        "last_activity" text,
        "session_id" integer,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "sold_at" timestamptz
      );
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY,
        "telegram_user_id" text NOT NULL,
        "telegram_username" text,
        "account_id" integer,
        "status" text NOT NULL DEFAULT 'pending',
        "payment_method" text,
        "amount" integer NOT NULL DEFAULT 0,
        "payment_id" text,
        "delivered_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "user_balances" (
        "id" serial PRIMARY KEY,
        "telegram_user_id" text NOT NULL UNIQUE,
        "balance" integer NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "telegram_sessions" (
        "id" serial PRIMARY KEY,
        "phone" text UNIQUE,
        "session_string" text,
        "dc_id" text,
        "auth_key" text,
        "country" text,
        "user_id" text,
        "first_name" text,
        "status" text NOT NULL DEFAULT 'pending',
        "phone_code_hash" text,
        "password" text,
        "file_path" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "news" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" serial PRIMARY KEY,
        "telegram_user_id" text NOT NULL UNIQUE,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "phone_prefix" text;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "description" text;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "is_free" text NOT NULL DEFAULT 'false';
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "has_premium" boolean NOT NULL DEFAULT false;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "spam_block" text;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "registration_date" text;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "origin" text;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "last_activity" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "phone" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "dc_id" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "auth_key" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "country" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "user_id" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "first_name" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "phone_code_hash" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "password" text;
      ALTER TABLE "telegram_sessions" ADD COLUMN IF NOT EXISTS "file_path" text;
    `);
    logger.info("Database migrations completed.");
  } catch (err) {
    logger.error({ err }, "Migration failed");
  } finally {
    client.release();
  }
}

runMigrations().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });

  startBot().catch((err) => {
    logger.error({ err }, "Bot startup error");
  });
});
