import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Process, fetchProcesses, fetchProcess, createProcess, updateProcess, deleteProcess } from "./api";
import ProcessList from "./components/ProcessList";
import ProcessCanvas from "./components/ProcessCanvas";

export default function App() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Liste
  const { data: processes = [], isLoading } = useQuery({
    queryKey: ["processes"],
    queryFn: fetchProcesses,
  });

  // Processus sélectionné
  const { data: selected, isLoading: loadingSelected } = useQuery({
    queryKey: ["process", selectedId],
    queryFn: () => fetchProcess(selectedId!),
    enabled: !!selectedId,
  });

  // Créer
  const createMut = useMutation({
    mutationFn: createProcess,
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setSelectedId(p.id);
    },
  });

  // Mise à jour (avec debounce intégré via onSuccess)
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Process, "name" | "description" | "graph">> }) =>
      updateProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      queryClient.invalidateQueries({ queryKey: ["process", selectedId] });
    },
  });

  // Supprimer
  const deleteMut = useMutation({
    mutationFn: deleteProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      if (selectedId) {
        // Passe au premier restant
        const remaining = processes.filter((p) => p.id !== selectedId);
        setSelectedId(remaining[0]?.id ?? null);
      }
    },
  });

  return (
    <div className="flex h-full">
      {/* Panneau gauche — liste */}
      <div className="w-80 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <ProcessList
          processes={processes}
          isLoading={isLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => createMut.mutate({ name: "Nouveau processus" })}
          onDelete={(id) => deleteMut.mutate(id)}
          onRename={(id, name) => updateMut.mutate({ id, data: { name } })}
        />
      </div>

      {/* Panneau droit — canvas React Flow */}
      <div className="flex-1">
        {selected && !loadingSelected ? (
          <ProcessCanvas
            process={selected}
            onGraphChange={(graph) => updateMut.mutate({ id: selected.id, data: { graph } })}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            {processes.length === 0
              ? "Créez un processus pour commencer"
              : "Sélectionnez un processus dans la liste"}
          </div>
        )}
      </div>
    </div>
  );
}
