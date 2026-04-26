import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStarredNotes } from "../services/noteService";
import { getStarredFiles } from "../services/fileService";
import Loader from "../components/Loader";
import { Tag, FileText, Paperclip, ChevronLeft } from "lucide-react";
import { getTagColor } from "../components/TagInput";

const TagsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Manual traversal to get all notes
      const { getDocs, collection } = await import("firebase/firestore");
      const { db } = await import("../services/firebase");
      const notes = [];
      const subjectsSnap = await getDocs(collection(db, "users", currentUser.uid, "subjects"));
      for (const subjectDoc of subjectsSnap.docs) {
        const foldersSnap = await getDocs(collection(db, "users", currentUser.uid, "subjects", subjectDoc.id, "folders"));
        for (const folderDoc of foldersSnap.docs) {
          const notesSnap = await getDocs(collection(db, "users", currentUser.uid, "subjects", subjectDoc.id, "folders", folderDoc.id, "notes"));
          for (const noteDoc of notesSnap.docs) {
            const data = noteDoc.data();
            if (data.tags?.length) {
              notes.push({
                id: noteDoc.id,
                ...data,
                _path: noteDoc.ref.path,
                subjectId: subjectDoc.id,
                folderId: folderDoc.id,
              });
            }
          }
        }
      }
      setAllNotes(notes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build tag → notes map
  const tagMap = {};
  for (const note of allNotes) {
    for (const tag of note.tags || []) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(note);
    }
  }
  const allTags = Object.keys(tagMap).sort();
  const filteredNotes = selectedTag ? tagMap[selectedTag] || [] : [];

  const navigateNote = (note) => {
    navigate(`/subject/${note.subjectId}/folder/${note.folderId}/note/${note.id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Tag size={16} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white dark:text-white text-xl font-bold">Tags</h2>
            <p className="text-slate-500 text-sm">{allTags.length} unique tag{allTags.length !== 1 ? "s" : ""} across your notes</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {loading ? (
          <Loader />
        ) : allTags.length === 0 ? (
          <div className="py-20 text-center">
            <Tag size={40} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No tags yet.</p>
            <p className="text-slate-600 text-xs mt-1">Open a note and add tags to organize your work.</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Tag list sidebar */}
            <div className="w-56 shrink-0">
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">All Tags</h3>
              <div className="space-y-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedTag === tag
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}>
                      #{tag}
                    </span>
                    <span className="text-slate-600 text-xs">{tagMap[tag].length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes for selected tag */}
            <div className="flex-1 min-w-0">
              {selectedTag ? (
                <>
                  <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(selectedTag)}`}>
                      #{selectedTag}
                    </span>
                    <span className="text-slate-600">— {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => navigateNote(note)}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-600 transition-all group"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <FileText size={15} className="text-violet-400 shrink-0 mt-0.5" />
                          <h4 className="text-slate-200 font-medium text-sm flex-1 truncate group-hover:text-white">
                            {note.title || "Untitled"}
                          </h4>
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-2 mb-3">
                          {note.content ? note.content.replace(/<[^>]+>/g, "") : "No content"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((t) => (
                            <span key={t} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTagColor(t)}`}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-600 text-sm">
                  Select a tag on the left to browse notes
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
