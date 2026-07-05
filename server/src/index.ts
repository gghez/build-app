import Fastify from "fastify";
import cors from "@fastify/cors";
import { v4 as uuid } from "uuid";
import { db } from "./db/index.js";
import { processes } from "./db/schema.js";
import { eq } from "drizzle-orm";

const server = Fastify({ logger: true });

await server.register(cors, { origin: true });

// ─── CRUD /api/processes ──────────────────────────────────────────

// GET /api/processes — liste tous les processus
server.get("/api/processes", async () => {
  return db.select().from(processes).orderBy(processes.updatedAt);
});

// GET /api/processes/:id
server.get<{ Params: { id: string } }>("/api/processes/:id", async (req, reply) => {
  const rows = await db.select().from(processes).where(eq(processes.id, req.params.id)).limit(1);
  if (!rows.length) return reply.status(404).send({ error: "Not found" });
  return rows[0];
});

// POST /api/processes — crée un processus
server.post<{ Body: { name: string; description?: string } }>(
  "/api/processes",
  async (req, reply) => {
    const { name, description = "" } = req.body;
    if (!name) return reply.status(400).send({ error: "name is required" });
    const id = uuid();
    const graph = { nodes: [], edges: [] };
    const [created] = await db.insert(processes).values({ id, name, description, graph }).returning();
    return reply.status(201).send(created);
  },
);

// PUT /api/processes/:id — met à jour (nom, description, graphe)
server.put<{ Params: { id: string }; Body: { name?: string; description?: string; graph?: { nodes: unknown[]; edges: unknown[] } } }>(
  "/api/processes/:id",
  async (req, reply) => {
    const { name, description, graph } = req.body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (graph !== undefined) updateData.graph = graph;

    const [updated] = await db
      .update(processes)
      .set(updateData)
      .where(eq(processes.id, req.params.id))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Not found" });
    return updated;
  },
);

// DELETE /api/processes/:id
server.delete<{ Params: { id: string } }>("/api/processes/:id", async (req, reply) => {
  const [deleted] = await db.delete(processes).where(eq(processes.id, req.params.id)).returning();
  if (!deleted) return reply.status(404).send({ error: "Not found" });
  return { deleted: true };
});

// ─── Start ─────────────────────────────────────────────────────────

const port = Number(process.env.PORT) || 3001;
await server.listen({ port, host: "0.0.0.0" });
console.log(`Server running on http://localhost:${port}`);
