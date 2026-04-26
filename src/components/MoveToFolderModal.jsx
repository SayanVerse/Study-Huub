import { useState, useEffect } from "react";
import { subscribeToStarredFolders, createStarredFolder } from "../services/starredService";
import { useAuth } from "../context/AuthContext";
import { Folder, X, Plus, AlertCircle } from "lucide-react";
import Loader from "./Loader";

const MoveToFolderModal = ({ onClose, onConfirm }) => {
  const { currentUser } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToStarredFolders(currentUser.uid, (data) => {
      setFolders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const docRef = await createStarredFolder(currentUser.uid, newFolderName.trim());
      setNewFolderName("");
      // optionally auto-select this new folder
      onConfirm(docRef.id);
    } catch (err) {
      setError("Failed to create folder: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-white font-semibold text-base">Move to Folder</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* Create new inline */}
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none transition-colors placeholder:text-slate-600"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={!newFolderName.trim() || creating}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl transition-all disabled:opacity-50"
              title="Create Folder"
            >
              <Plus size={18} />
            </button>
          </form>

          {/* Folder list */}
          <div>
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
              Existing Folders
            </h3>
            {loading ? (
              <div className="py-4"><Loader /></div>
            ) : folders.length === 0 ? (
              <p className="text-slate-600 text-sm py-2 text-center">No starred folders yet.</p>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => onConfirm(null)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/60 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <X size={15} className="text-slate-400 group-hover:text-white" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white">
                    Remove from folder (Keep in Starred)
                  </span>
                </button>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => onConfirm(folder.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-800/30 hover:bg-amber-500/10 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Folder size={15} className="text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium group-hover:text-amber-400 truncate">
                      {folder.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
