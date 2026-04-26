import { useState, useEffect } from "react";
import { subscribeToSubjects } from "../services/subjectService";
import { useAuth } from "../context/AuthContext";

export const useSubjects = () => {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsub = subscribeToSubjects(currentUser.uid, (data) => {
      setSubjects(data);
      setLoading(false);
    });
    return () => {
      unsub();
      setLoading(false);
    };
  }, [currentUser]);

  return { subjects, loading, error };
};
