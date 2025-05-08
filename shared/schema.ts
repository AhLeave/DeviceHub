import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  tenantId: integer("tenant_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Tenant schema
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  plan: text("plan").default("basic"),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
});

// Device schema
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  name: text("name"),
  model: text("model"),
  platform: text("platform").notNull(), // ios, android, ipados
  osVersion: text("os_version"),
  status: text("status").default("offline"), // online, offline, warning
  lastSeen: timestamp("last_seen"),
  enrollmentDate: timestamp("enrollment_date"),
  userId: integer("user_id"),
  tenantId: integer("tenant_id").notNull(),
  compliance: text("compliance").default("compliant"), // compliant, warning, non-compliant
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
});

// Enrollment tokens
export const enrollmentTokens = pgTable("enrollment_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  tenantId: integer("tenant_id").notNull(),
  platform: text("platform").notNull(),
  assignedGroup: text("assigned_group"),
  userEmail: text("user_email"),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
});

export const insertEnrollmentTokenSchema = createInsertSchema(enrollmentTokens).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type EnrollmentToken = typeof enrollmentTokens.$inferSelect;
export type InsertEnrollmentToken = z.infer<typeof insertEnrollmentTokenSchema>;
