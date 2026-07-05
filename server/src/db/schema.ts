import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const processes = pgTable("processes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  graph: jsonb("graph").$type<{ nodes: unknown[]; edges: unknown[] }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
