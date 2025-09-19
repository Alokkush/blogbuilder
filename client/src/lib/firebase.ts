import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    email: user.email,
    name: name,
    createdAt: new Date(),
  });

  // Also register user in our backend database
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({
        email: user.email,
        name: name,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to register user in backend database:', response.statusText);
    }
  } catch (error) {
    console.warn('Failed to register user in backend database:', error);
  }
  
  return user;
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const createBlog = async (blogData: any) => {
  const docRef = await addDoc(collection(db, 'blogs'), {
    ...blogData,
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
  });
  return docRef.id;
};

export const updateBlog = async (blogId: string, updates: any) => {
  const blogRef = doc(db, 'blogs', blogId);
  await updateDoc(blogRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteBlog = async (blogId: string) => {
  await deleteDoc(doc(db, 'blogs', blogId));
};

export const getBlog = async (blogId: string) => {
  const blogDoc = await getDoc(doc(db, 'blogs', blogId));
  if (blogDoc.exists()) {
    const data = blogDoc.data();
    return { id: blogDoc.id, ...data } as any;
  }
  return null;
};

export const getUserBlogs = async (userId: string) => {
  const q = query(
    collection(db, 'blogs'),
    where('authorId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPublishedBlogs = async (limit = 20) => {
  const q = query(
    collection(db, 'blogs'),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const blogs = querySnapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Get author details for each blog
  const blogsWithAuthors = await Promise.all(
    blogs.map(async (blog: any) => {
      const authorDoc = await getDoc(doc(db, 'users', blog.authorId));
      const author = authorDoc.exists() ? { id: authorDoc.id, ...authorDoc.data() } : null;
      return { ...blog, author };
    })
  );
  
  return blogsWithAuthors;
};

export const incrementBlogViews = async (blogId: string) => {
  const blogRef = doc(db, 'blogs', blogId);
  await updateDoc(blogRef, {
    views: increment(1)
  });
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
