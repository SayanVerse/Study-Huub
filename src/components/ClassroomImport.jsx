import { useState } from "react";
import { getClassroomCourses } from "../services/classroomService";
import { createSubject } from "../services/subjectService";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, X, RefreshCw, Check, AlertCircle } from "lucide-react";

const ClassroomImport = ({ onClose, onImported }) => {
  const { currentUser, classroomToken } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const fetchCourses = async () => {
    if (!classroomToken) {
      setError("No Classroom access. Please sign in with Google first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getClassroomCourses(classroomToken);
      setCourses(data);
      if (data.length === 0) setError("No active courses found in Google Classroom.");
    } catch (e) {
      setError(e.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      const toImport = courses.filter((c) => selected.has(c.id));
      await Promise.all(
        toImport.map((c) =>
          createSubject(currentUser.uid, c.name || c.section || "Untitled Course")
        )
      );
      setDone(true);
      setTimeout(() => {
        onImported?.();
        onClose();
      }, 1200);
    } catch (e) {
      setError("Import failed: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600/20 rounded-lg flex items-center justify-center">
              <GraduationCap size={15} className="text-green-400" />
            </div>
            <h2 className="text-white font-semibold text-base">
              Import from Google Classroom
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          {!classroomToken && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-300 text-xs leading-relaxed">
                Google Classroom access requires signing in with Google. Email/password users cannot import courses.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {courses.length === 0 && !loading ? (
            <button
              onClick={fetchCourses}
              disabled={!classroomToken}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500
                text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={15} />
              Load My Courses
            </button>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-7 h-7 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-4">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${selected.has(course.id)
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-slate-700 hover:border-slate-600 bg-slate-800/50"}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(course.id)}
                    onChange={() => toggleSelect(course.id)}
                    className="accent-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{course.name}</p>
                    {course.section && (
                      <p className="text-slate-500 text-xs truncate">{course.section}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <button
              onClick={handleImport}
              disabled={selected.size === 0 || importing || done}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${done
                  ? "bg-emerald-600 text-white"
                  : "bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"}`}
            >
              {done ? (
                <><Check size={15} /> Imported!</>
              ) : importing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `Import ${selected.size > 0 ? `${selected.size} ` : ""}Selected`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomImport;
