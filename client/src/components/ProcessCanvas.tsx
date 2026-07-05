import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Process, ProcessGraph } from "../api";

interface Props {
  process: Process;
  onGraphChange: (graph: ProcessGraph) => void;
}

const nodeDefaults = {
  style: {
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #475569",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
  },
};

export default function ProcessCanvas({ process, onGraphChange }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    process.graph.nodes as Node[],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    process.graph.edges as Edge[],
  );

  // Références pour éviter le problème de closure stale
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const persist = useCallback(() => {
    onGraphChange({ nodes: nodesRef.current, edges: edgesRef.current });
  }, [onGraphChange]);

  // Connexion entre nœuds
  const onConnect = useCallback(
    (conn: Connection) => {
      setEdges((eds) => {
        const next = addEdge(conn, eds);
        edgesRef.current = next;
        onGraphChange({ nodes: nodesRef.current, edges: next });
        return next;
      });
    },
    [setEdges, onGraphChange],
  );

  // Sauvegarde après drag de nœud
  const onNodeDragStop = useCallback(() => persist(), [persist]);
  // Sauvegarde après connexion terminée
  const onConnectEnd = useCallback(() => persist(), [persist]);

  // Ajouter un nœud au double-clic sur le fond
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const pane = (event.target as HTMLElement).closest(".react-flow__pane");
      if (!pane) return;
      const bounds = pane.getBoundingClientRect();
      // React Flow applique un transform au viewport ; on utilise la position
      // relative au panneau en ignorant le zoom pour simplifier
      const position = {
        x: event.clientX - bounds.left - 60,
        y: event.clientY - bounds.top - 20,
      };
      const id = `node-${Date.now()}`;
      const newNode: Node = {
        id,
        position,
        data: { label: "Étape" },
        ...nodeDefaults,
      };
      setNodes((nds) => {
        const next = [...nds, newNode];
        nodesRef.current = next;
        onGraphChange({ nodes: next, edges: edgesRef.current });
        return next;
      });
    },
    [setNodes, onGraphChange],
  );

  // Renommer un nœud au double-clic
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const label = prompt("Nom de l'étape :", String(node.data.label ?? ""));
      if (label !== null) {
        setNodes((nds) => {
          const next = nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, label } } : n,
          );
          nodesRef.current = next;
          onGraphChange({ nodes: next, edges: edgesRef.current });
          return next;
        });
      }
    },
    [setNodes, onGraphChange],
  );

  // Supprimer les nœuds/edges supprimés via touche clavier
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // Si un nœud est supprimé, on persiste
      const hasRemoval = changes.some((c) => c.type === "remove");
      if (hasRemoval) {
        // On attend le batch de mise à jour
        setTimeout(() => persist(), 0);
      }
    },
    [onNodesChange, persist],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      const hasRemoval = changes.some((c) => c.type === "remove");
      if (hasRemoval) {
        setTimeout(() => persist(), 0);
      }
    },
    [onEdgesChange, persist],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onPaneDoubleClick={onPaneDoubleClick}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
      >
        <Background color="#334155" gap={20} />
        <Controls className="!bg-gray-800 !border-gray-700 !fill-gray-300" />
        <MiniMap
          nodeColor="#475569"
          maskColor="rgba(0,0,0,0.7)"
          className="!bg-gray-900 !border-gray-700"
        />
      </ReactFlow>

      {/* Bouton sauvegarde manuelle */}
      <button
        onClick={persist}
        className="absolute bottom-4 right-4 z-10 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow-lg"
      >
        Sauvegarder
      </button>
    </div>
  );
}
