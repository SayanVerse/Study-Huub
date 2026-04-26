/**
 * Google Classroom API Service
 * Requires: user signed in with Google (classroom.courses.readonly scope)
 * accessToken is obtained from GoogleAuthProvider credential after sign-in
 */

const CLASSROOM_API = "https://classroom.googleapis.com/v1";

export const getClassroomCourses = async (accessToken) => {
  const res = await fetch(
    `${CLASSROOM_API}/courses?courseStates=ACTIVE&pageSize=30`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to fetch Classroom courses");
  }
  const data = await res.json();
  return data.courses || [];
};
