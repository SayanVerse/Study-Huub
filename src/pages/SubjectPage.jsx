import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFolders } from "../hooks/useFolders";
import { createFolder, deleteFolder } from "../services/folderService";
import FolderCard from "../components/FolderCard";
import CreateModal from "../components/CreateModal";
import Loader from "../components/Loader";
import { Plus, FolderOpen, ChevronLeft } from "lucide-react";

const SubjectPage = () => {
  const { subjectId } = useParams();
  const { currentUser } = useAuth();
  const { folders, loading } = useFolders(subjectId);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (name) => {
    setCreating(true);
    try {
      await createFolder(currentUser.uid, subjectId, name);
      setShowCreate(false);
    } catch (err) {
      console.error("Create folder error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (folderId) => {
    try {
      await deleteFolder(currentUser.uid, subjectId, folderId);
    } catch (err) {
      console.error("Delete folder error:", err);
    }
  };

  return (
    <div className="flex-1">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-bold">Folders</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {folders.length} folder{folders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
              text-white text-sm font-medium transition-all shadow-lg shadow-violet-900/40 self-start sm:self-auto"
          >
            <Plus size={16} />
            New Folder
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {loading ? (
          <Loader />
        ) : folders.length === 0 ? (
          <EmptyFolders onAdd={() => setShowCreate(true)} />
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={(fid) => navigate(`/subject/${subjectId}/folder/${fid}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          title="New Folder"
          placeholder="e.g. Week 1, Chapter 3..."
          onConfirm={handleCreate}
          onClose={() => setShowCreate(false)}
          loading={creating}
        />
      )}
    </div>
  );
};

const EmptyFolders = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-4">
      <FolderOpen size={28} className="text-violet-400" />
    </div>
    <h3 className="text-slate-200 font-semibold mb-2">No folders yet</h3>
    <p className="text-slate-500 text-sm mb-5 max-w-xs">
      Create folders to organize your notes by topic or week.
    </p>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
        rounded-xl transition-all"
    >
      <Plus size={15} /> Create Folder
    </button>
  </div>
);

export default SubjectPage;
