import { pgTable, text, serial, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const otherAccountsTable = pgTable("other_accounts", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  login: text("login").notNull(),
  password: text("password").notNull(),
  email: text("email"),
  emailPassword: text("email_password"),
  description: text("description"),
  preDescription: text("pre_description"),
  price: doublePrecision("price").notNull().default(0),
  isFree: text("is_free").notNull().default("false"),
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  soldAt: timestamp("sold_at", { withTimezone: true }),
});

export const insertOtherAccountSchema = createInsertSchema(otherAccountsTable).omit({ id: true, createdAt: true });
export type InsertOtherAccount = z.infer<<typeof insertOtherAccountSchema>;
export type OtherAccount = typeof otherAccountsTable.$inferSelect;