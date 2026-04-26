import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubjects } from "../hooks/useSubjects";
import { createSubject, deleteSubject } from "../services/subjectService";
import SubjectCard from "../components/SubjectCard";
import CreateModal from "../components/CreateModal";
import ClassroomImport from "../components/ClassroomImport";
import Loader from "../components/Loader";
import { Plus, GraduationCap, BookOpen } from "lucide-react";

const DashboardPage = () => {
  const { currentUser, classroomToken } = useAuth();
  const { subjects, loading } = useSubjects();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showClassroom, setShowClassroom] = useState(false);
  const [creating, setCreating] = useState(false);

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
          <div className="flex items-center gap-2">
            {classroomToken && (
              <button
                onClick={() => setShowClassroom(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 border border-green-600/30
                  text-green-300 text-sm font-medium hover:bg-green-600/30 transition-all"
              >
                <GraduationCap size={16} />
                <span className="hidden sm:inline">Import from Classroom</span>
                <span className="sm:hidden">Classroom</span>
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
                text-white text-sm font-medium transition-all shadow-lg shadow-violet-900/40"
            >
              <Plus size={16} />
              New Subject
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {loading ? (
          <Loader />
        ) : subjects.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={(id) => navigate(`/subject/${id}`)}
                onDelete={handleDelete}
              />
            ))}
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

      {showClassroom && (
        <ClassroomImport
          onClose={() => setShowClassroom(false)}
          onImported={() => {}}
        />
      )}
    </div>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-5">
      <BookOpen size={36} className="text-violet-400" />
    </div>
    <h3 className="text-slate-200 font-semibold text-lg mb-2">No subjects yet</h3>
    <p className="text-slate-500 text-sm mb-6 max-w-xs">
      Create your first subject to organize your notes, folders, and files.
    </p>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
        rounded-xl transition-all shadow-lg shadow-violet-900/40"
    >
      <Plus size={15} />
      Create Subject
    </button>
  </div>
);

export default DashboardPage;
