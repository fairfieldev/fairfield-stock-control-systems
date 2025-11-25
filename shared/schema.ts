import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z} from "zod";

// Users with role-based permissions
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // hashed or plain for demo
  role: text("role").notNull(), // admin, dispatch, receiver, view_only
  permissions: json("permissions").$type<string[]>().default([]), // tab permissions
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(), // pieces, boxes, kg, liters
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Locations/Branches
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull().unique(),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Transfers
export const transfers = pgTable("transfers", {
  id: varchar("id").primaryKey(),
  fromLocationId: text("from_location_id").notNull(),
  toLocationId: text("to_location_id").notNull(),
  driverName: text("driver_name").notNull(),
  vehicleReg: text("vehicle_reg").notNull(),
  status: text("status").notNull(), // pending, in_transit, received
  items: json("items").$type<TransferItem[]>().notNull(),
  dispatchedBy: text("dispatched_by"),
  dispatchedAt: timestamp("dispatched_at"),
  receivedBy: text("received_by"),
  receivedAt: timestamp("received_at"),
  shortages: json("shortages").$type<ShortageItem[]>(),
  damages: json("damages").$type<DamageItem[]>(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TransferItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
};

export type ShortageItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantityShort: number;
};

export type DamageItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantityDamaged: number;
  reason: string;
};

export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, createdAt: true });
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfers.$inferSelect;

// Returns
export const returns = pgTable("returns", {
  id: varchar("id").primaryKey(),
  transferId: text("transfer_id"),
  locationId: text("location_id").notNull(),
  productId: text("product_id").notNull(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  loggedBy: text("logged_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReturnSchema = createInsertSchema(returns).omit({ id: true, createdAt: true });
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returns.$inferSelect;

// Email Integration Settings
export const emailSettings = pgTable("email_settings", {
  id: varchar("id").primaryKey().default("default"),
  provider: text("provider"), // sendgrid, resend, gmail, smtp
  recipientEmail: text("recipient_email").notNull(),
  senderEmail: text("sender_email"),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUsername: text("smtp_username"),
  smtpPassword: text("smtp_password"),
  apiKey: text("api_key"),
  configured: boolean("configured").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailSettingsSchema = createInsertSchema(emailSettings).omit({ id: true, updatedAt: true });
export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettings.$inferSelect;

// System Settings (for logo storage)
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default("default"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
