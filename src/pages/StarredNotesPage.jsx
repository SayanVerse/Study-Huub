import { useNavigate } from "react-router-dom";
import { useStarredNotes } from "../hooks/useStarredNotes";
import Loader from "../components/Loader";
import { Star, FileText, RefreshCw } from "lucide-react";

const StarredNotesPage = () => {
  const { starredNotes, loading, error, refetch } = useStarredNotes();
  const navigate = useNavigate();

  // Parse subjectId and folderId from the Firestore path
  const parseNoteRoute = (note) => {
    if (!note._path) return null;
    // Path: users/{uid}/subjects/{sid}/folders/{fid}/notes/{nid}
    const parts = note._path.split("/");
    if (parts.length < 8) return null;
    return {
      subjectId: parts[3],
      folderId: parts[5],
      noteId: parts[7],
    };
  };

  return (
    <div className="flex-1">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Starred Notes</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {starredNotes.length} starred note{starredNotes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={refetch}
              className="text-violet-400 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        ) : starredNotes.length === 0 ? (
          <EmptyStarred />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {starredNotes.map((note) => {
              const route = parseNoteRoute(note);
              const preview = note.content
                ? note.content.replace(/<[^>]+>/g, "").substring(0, 120)
                : "";
              const createdDate = note.createdAt?.toDate?.()
                ? new Date(note.createdAt.toDate()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    if (route) {
                      navigate(
                        `/subject/${route.subjectId}/folder/${route.folderId}/note/${route.noteId}`
                      );
                    }
                  }}
                  className="group bg-slate-900 border border-amber-500/20 rounded-xl p-4 cursor-pointer
                    hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/10 transition-all duration-150 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <FileText size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <h3 className="text-slate-100 font-medium text-sm flex-1 truncate">
                      {note.title || "Untitled"}
                    </h3>
                    <Star
                      size={14}
                      className="text-amber-400 shrink-0"
                      fill="currentColor"
                    />
                  </div>
                  {preview && (
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
                      {preview}
                    </p>
                  )}
                  <span className="text-slate-600 text-xs">{createdDate}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyStarred = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
      <Star size={28} className="text-amber-400" />
    </div>
    <h3 className="text-slate-200 font-semibold mb-2">No starred notes</h3>
    <p className="text-slate-500 text-sm max-w-xs">
      Open any note and click the ⭐ star icon to save it here for quick access.
    </p>
  </div>
);

export default StarredNotesPage;
