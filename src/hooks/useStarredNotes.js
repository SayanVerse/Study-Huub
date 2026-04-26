import { useState, useEffect, useCallback } from "react";
import { getStarredNotes } from "../services/noteService";
import { useAuth } from "../context/AuthContext";

export const useStarredNotes = () => {
  const { currentUser } = useAuth();
  const [starredNotes, setStarredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStarred = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const notes = await getStarredNotes(currentUser.uid);
      setStarredNotes(notes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

  return { starredNotes, loading, error, refetch: fetchStarred };
};
