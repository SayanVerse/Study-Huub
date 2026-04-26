import { useState, useEffect } from "react";
import { subscribeToFolders } from "../services/folderService";
import { useAuth } from "../context/AuthContext";

export const useFolders = (subjectId) => {
  const { currentUser } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !subjectId) return;
    setLoading(true);
    const unsub = subscribeToFolders(currentUser.uid, subjectId, (data) => {
      setFolders(data);
      setLoading(false);
    });
    return () => {
      unsub();
      setLoading(false);
    };
  }, [currentUser, subjectId]);

  return { folders, loading };
};
