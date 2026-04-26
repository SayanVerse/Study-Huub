import { useState, useEffect } from "react";
import { subscribeToFiles } from "../services/fileService";
import { useAuth } from "../context/AuthContext";

export const useFiles = (subjectId, folderId) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !subjectId || !folderId) return;
    setLoading(true);
    const unsub = subscribeToFiles(currentUser.uid, subjectId, folderId, (data) => {
      setFiles(data);
      setLoading(false);
    });
    return () => {
      unsub();
      setLoading(false);
    };
  }, [currentUser, subjectId, folderId]);

  return { files, loading };
};
