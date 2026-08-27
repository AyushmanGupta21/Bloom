import { integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(2),
  maxCredits: integer().default(2)
});

export const projectTable = pgTable('projects', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar({ length: 255 }).unique(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.email),
  createdOn: timestamp().defaultNow()
});

export const frameTable = pgTable('frames', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar({ length: 255 }).unique(),
  designCode: text(),
  projectId: varchar({ length: 255 }).references(() => projectTable.projectId),
  createdOn: timestamp().defaultNow()
});

export const chatTable = pgTable('chats', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: json(),
  frameId: varchar({ length: 255 }).references(() => frameTable.frameId),
  createdBy: varchar({ length: 255 }).references(() => usersTable.email),
  createdOn: timestamp().defaultNow()
});

export const generationsTable = pgTable('generations', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  generationId: varchar({ length: 255 }).unique().notNull(),
  projectId: varchar({ length: 255 }).references(() => projectTable.projectId),
  frameId: varchar({ length: 255 }).references(() => frameTable.frameId),
  userId: varchar({ length: 255 }),
  provider: varchar({ length: 50 }).notNull(), // 'nvidia' | 'openrouter'
  modelId: varchar({ length: 100 }).notNull(), // 'bloom-reason'
  canonicalModelId: varchar({ length: 255 }).notNull(), // 'nvidia/llama-3.1-nemotron-70b-instruct'
  displayName: varchar({ length: 100 }).notNull(), // 'Bloom Reason'
  prompt: text().notNull(),
  output: text(),
  reasoning: text(),
  status: varchar({ length: 50 }).default('completed'), // 'started' | 'completed' | 'failed' | 'cancelled'
  durationMs: integer(),
  promptTokens: integer(),
  completionTokens: integer(),
  totalTokens: integer(),
  finishReason: varchar({ length: 50 }),
  error: text(),
  createdOn: timestamp().defaultNow()
});