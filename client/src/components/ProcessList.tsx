import { type Process } from "../api";

interface Props {
  processes: Process[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export default function ProcessList({
  processes,
  isLoading,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: Props) {
  return (
    <>
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
          Processus
        </h2>
        <button
          onClick={onCreate}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
        >
          + Nouveau
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">Chargement…</div>
        ) : processes.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Aucun processus</div>
        ) : (
          processes.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-800/50 text-sm ${
                p.id === selectedId
                  ? "bg-blue-900/30 border-l-2 border-l-blue-500"
                  : "hover:bg-gray-800/50"
              }`}
            >
              <input
                className="flex-1 bg-transparent outline-none text-gray-200 group-hover:text-white"
                value={p.name}
                onChange={(e) => onRename(p.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-gray-800 text-xs text-gray-600">
        {processes.length} processus
      </div>
    </>
  );
}
