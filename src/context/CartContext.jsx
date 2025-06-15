import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(null);
  const { currentUser } = useAuth();

  // Load cart items and displayName from Firestore when user logs in
  useEffect(() => {
    const loadCartItems = async () => {
      if (!currentUser) {
        setCartItems([]);
        setDisplayName(null);
        setLoading(false);
        return;
      }

      try {
        // Set displayName from currentUser
        setDisplayName(currentUser.displayName || "Anonymous");

        const cartRef = doc(db, "carts", currentUser.uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          setCartItems(cartDoc.data().items || []);
        } else {
          // Create empty cart if it doesn't exist
          await setDoc(cartRef, { items: [] });
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, [currentUser]);

  // Update cart in Firestore whenever it changes
  useEffect(() => {
    const updateCartInFirestore = async () => {
      if (!currentUser || loading) return;

      try {
        const cartRef = doc(db, "carts", currentUser.uid);
        await updateDoc(cartRef, { items: cartItems });
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    };

    updateCartInFirestore();
  }, [cartItems, currentUser, loading]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    if (!currentUser) return;

    try {
      const cartRef = doc(db, "carts", currentUser.uid);
      await setDoc(cartRef, { items: [] }); // kosongkan di Firestore juga
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    displayName,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};