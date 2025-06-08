import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (user) => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      console.log("Checking admin role for user:", user.uid);
      const userDocRef = doc(db, "users", user.uid);
      console.log("User document reference:", userDocRef);
      
      const userDoc = await getDoc(userDocRef);
      console.log("User document exists:", userDoc.exists());
      console.log("User document data:", userDoc.data());
      
      const isUserAdmin = userDoc.exists() && userDoc.data().role === "admin";
      console.log("Is user admin:", isUserAdmin);
      
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const signup = async (email, password, displayName, isAdmin = false, phone = '', address = '') => {
    try {
      console.log("Starting signup process...");
      console.log("Firestore instance:", db);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created with ID:", user.uid);

      // Update profile
      await updateProfile(user, { displayName });
      console.log("Profile updated with display name:", displayName);

      // Create user document in Firestore
      const userData = {
        email: user.email,
        displayName: displayName,
        role: isAdmin ? "admin" : "user",
        createdAt: new Date().toISOString(),
        phone: phone,
        address: address,
      };
      console.log("Creating user document with data:", userData);
      
      const userDocRef = doc(db, "users", user.uid);
      console.log("User document reference:", userDocRef);
      
      await setDoc(userDocRef, userData);
      console.log("User document created successfully");

      // Verify the document was created
      const createdDoc = await getDoc(userDocRef);
      console.log("Verification - Document exists:", createdDoc.exists());
      console.log("Verification - Document data:", createdDoc.data());

      // Check admin role after creating user document
      await checkAdminRole(user);
      
      return user;
    } catch (error) {
      console.error("Error in signup process:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Starting login process...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User logged in with ID:", user.uid);
      
      const isUserAdmin = await checkAdminRole(user);
      console.log("Login - Is user admin:", isUserAdmin);
      
      return user;
    } catch (error) {
      console.error("Error in login process:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user...");
      setIsAdmin(false);
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error in logout process:", error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
  if (!auth.currentUser) return;

  const user = auth.currentUser;

  // Update ke Firebase Auth (hanya displayName yg bisa diupdate langsung)
  if (updates.displayName) {
    await updateProfile(user, { displayName: updates.displayName });
  }

  // Update ke Firestore
  const userDocRef = doc(db, "users", user.uid);
  await setDoc(userDocRef, updates, { merge: true });

  // Refresh currentUser dengan data terbaru
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const newUserData = userDocSnap.data();
    setCurrentUser({
      ...user,
      ...newUserData,
      metadata: user.metadata,
    });
  }
};


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Gabungkan user Firebase Auth dengan data tambahan dari Firestore
        const mergedUser = {
          ...user,
          ...userData,
          metadata: user.metadata, // tetap bawa metadata
        };

        setCurrentUser(mergedUser);
        setIsAdmin(userData.role === "admin");
      } else {
        setCurrentUser(user); // fallback jika tidak ada dokumen
        setIsAdmin(false);
      }
    } else {
      setCurrentUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);


  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};