import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const filesRef = (userId, subjectId, folderId) =>
  collection(
    db,
    "users",
    userId,
    "subjects",
    subjectId,
    "folders",
    folderId,
    "files"
  );

export const subscribeToFiles = (userId, subjectId, folderId, callback) => {
  const q = query(filesRef(userId, subjectId, folderId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const files = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(files);
  });
};

/**
 * Upload file to Cloudinary (free tier — 25 GB storage, no credit card needed)
 * Requires: VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET in .env
 */
export const uploadFile = async (userId, subjectId, folderId, file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file."
    );
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `studyhub/${userId}/${subjectId}/${folderId}`);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        // Save metadata to Firestore
        const docRef = await addDoc(filesRef(userId, subjectId, folderId), {
          fileName: file.name,
          fileURL: data.secure_url,
          publicId: data.public_id,  // needed for deletion
          fileType: file.type,
          subjectId,
          folderId,
          createdAt: serverTimestamp(),
        });
        resolve({ id: docRef.id, fileURL: data.secure_url, fileName: file.name });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload network error")));

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.send(formData);
  });
};

/**
 * Delete file — removes Firestore record.
 * Note: Cloudinary deletion from frontend requires the API secret (unsafe to expose).
 * Files are removed from Firestore; they'll be cleaned up via Cloudinary dashboard
 * or a backend function if needed later.
 */
export const deleteFile = async (userId, subjectId, folderId, fileId) => {
  await deleteDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "files", fileId)
  );
};
