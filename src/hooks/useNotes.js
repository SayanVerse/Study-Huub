import { useState, useEffect } from "react";
import { subscribeToNotes } from "../services/noteService";
import { useAuth } from "../context/AuthContext";

export const useNotes = (subjectId, folderId) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !subjectId || !folderId) return;
    setLoading(true);
    const unsub = subscribeToNotes(currentUser.uid, subjectId, folderId, (data) => {
      setNotes(data);
      setLoading(false);
    });
    return () => {
      unsub();
      setLoading(false);
    };
  }, [currentUser, subjectId, folderId]);

  return { notes, loading };
};
