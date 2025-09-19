import { initializeApp, cert, getApps, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Use proper server-side environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.error("Firebase project ID not found. Set FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID environment variable.");
    throw new Error("Firebase configuration missing");
  }

  const firebaseConfig = {
    projectId: projectId,
  };

  console.log(`Initializing Firebase Admin with project ID: ${projectId}`);
  initializeApp(firebaseConfig);
}

export const adminAuth = getAuth();

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}