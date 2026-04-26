import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubjects } from "../hooks/useSubjects";
import { createSubject, deleteSubject, renameSubject } from "../services/subjectService";
import SubjectCard from "../components/SubjectCard";
import CreateModal from "../components/CreateModal";
import ClassroomImport from "../components/ClassroomImport";
import Loader from "../components/Loader";
import { Plus, GraduationCap, BookOpen, Clock } from "lucide-react";
import RecentActivity from "../components/RecentActivity";

const DashboardPage = () => {
  const { currentUser, classroomToken } = useAuth();
  const { subjects, loading } = useSubjects();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showClassroom, setShowClassroom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingSubject, setRenamingSubject] = useState(null);
  const [renaming, setRenaming] = useState(false);

  const handleCreate = async (name) => {
    setCreating(true);
    try {
      await createSubject(currentUser.uid, name);
      setShowCreate(false);
    } catch (err) {
      console.error("Create subject error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (newName) => {
    if (!renamingSubject) return;
    setRenaming(true);
    try {
      await renameSubject(currentUser.uid, renamingSubject.id, newName);
      setRenamingSubject(null);
    } catch (err) {
      console.error("Rename subject error:", err);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (subjectId) => {
    try {
      await deleteSubject(currentUser.uid, subjectId);
    } catch (err) {
      console.error("Delete subject error:", err);
    }
  };

  return (
    <div className="flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-bold">My Subjects</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowClassroom(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 border border-green-600/30
                text-green-300 text-sm font-medium hover:bg-green-600/30 transition-all shrink-0 whitespace-nowrap"
            >
              <GraduationCap size={16} className="shrink-0" />
              <span className="hidden sm:inline">Import from Classroom</span>
              <span className="sm:hidden">Classroom</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
                text-white text-sm font-medium transition-all shadow-lg shadow-violet-900/40 shrink-0 whitespace-nowrap"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">New Subject</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content: two-column layout on large screens */}
      <div className="px-6 pb-6 flex gap-6">
        <div className="flex-1 min-w-0">
          {loading ? (
            <Loader />
          ) : subjects.length === 0 ? (
            <EmptyState onAdd={() => setShowCreate(true)} onImport={() => setShowClassroom(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={(id) => navigate(`/subject/${id}`)}
                  onDelete={handleDelete}
                  onEdit={() => setRenamingSubject(subject)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity panel — only shown when there are subjects */}
        {subjects.length > 0 && (
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-4 border rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-violet-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent Activity</h3>
              </div>
              <RecentActivity />
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          title="New Subject"
          placeholder="e.g. Mathematics, Physics..."
          onConfirm={handleCreate}
          onClose={() => setShowCreate(false)}
          loading={creating}
        />
      )}

      {renamingSubject && (
        <CreateModal
          title="Rename Subject"
          placeholder="Enter new subject name..."
          initialValue={renamingSubject.name}
          onConfirm={handleRename}
          onClose={() => setRenamingSubject(null)}
          loading={renaming}
        />
      )}

      {showClassroom && (
        <ClassroomImport
          onClose={() => setShowClassroom(false)}
          onImported={() => {}}
        />
      )}
    </div>
  );
};

const EmptyState = ({ onAdd, onImport }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-5">
      <BookOpen size={36} className="text-violet-400" />
    </div>
    <h3 className="text-slate-200 font-semibold text-lg mb-2">No subjects yet</h3>
    <p className="text-slate-500 text-sm mb-6 max-w-xs">
      Create your first subject to organize your notes, folders, and files.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
          rounded-xl transition-all shadow-lg shadow-violet-900/40 shrink-0 whitespace-nowrap"
      >
        <Plus size={15} className="shrink-0" />
        Create Subject
      </button>
      <button
        onClick={onImport}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-300 text-sm font-medium
          rounded-xl transition-all shrink-0 whitespace-nowrap"
      >
        <GraduationCap size={15} className="shrink-0" />
        Import from Classroom
      </button>
    </div>
  </div>
);

export default DashboardPage;
