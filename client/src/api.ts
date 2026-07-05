// ─── Types ──────────────────────────────────────────────────────────

export interface ProcessNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface ProcessEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProcessGraph {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
}

export interface Process {
  id: string;
  name: string;
  description: string;
  graph: ProcessGraph;
  createdAt: string;
  updatedAt: string;
}

// ─── API client ────────────────────────────────────────────────────

const BASE = "/api";

export async function fetchProcesses(): Promise<Process[]> {
  const res = await fetch(`${BASE}/processes`);
  if (!res.ok) throw new Error(`GET /processes failed: ${res.status}`);
  return res.json();
}

export async function fetchProcess(id: string): Promise<Process> {
  const res = await fetch(`${BASE}/processes/${id}`);
  if (!res.ok) throw new Error(`GET /processes/${id} failed: ${res.status}`);
  return res.json();
}

export async function createProcess(data: { name: string; description?: string }): Promise<Process> {
  const res = await fetch(`${BASE}/processes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /processes failed: ${res.status}`);
  return res.json();
}

export async function updateProcess(id: string, data: Partial<Pick<Process, "name" | "description" | "graph">>): Promise<Process> {
  const res = await fetch(`${BASE}/processes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT /processes/${id} failed: ${res.status}`);
  return res.json();
}

export async function deleteProcess(id: string): Promise<void> {
  const res = await fetch(`${BASE}/processes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /processes/${id} failed: ${res.status}`);
}
