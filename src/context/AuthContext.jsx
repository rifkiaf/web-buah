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

  const signup = async (email, password, displayName, isAdmin = false) => {
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

  const updateUserProfile = async (data) => {
    if (currentUser) {
      try {
        await updateProfile(currentUser, data);
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            ...data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.uid);
      setCurrentUser(user);
      if (user) {
        const isUserAdmin = await checkAdminRole(user);
        console.log("Auth state changed - Is user admin:", isUserAdmin);
      } else {
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