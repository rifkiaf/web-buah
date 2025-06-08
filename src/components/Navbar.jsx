import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const { getCartItemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveLink = (path) => {
    return location.pathname === path ? "bg-white/20" : "";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-gradient-to-r from-green-500 to-green-600"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center space-x-3 transition-opacity hover:opacity-90 ${
              isScrolled ? "text-green-600" : "text-white"
            }`}
          >
            <span className="text-2xl">🍎</span>
            <span className="font-bold text-xl tracking-wide">Sari Buah</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/20"
              } ${isActiveLink("/")}`}
            >
              Beranda
            </Link>
            <Link
              to="/products"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/20"
              } ${isActiveLink("/products")}`}
            >
              Produk
            </Link>
            {currentUser && !isAdmin && (
              <Link
                to="/cart"
                className={`relative px-4 py-2 rounded-md font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/20"
                } ${isActiveLink("/cart")}`}
              >
                <span className="flex items-center">
                  Keranjang
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {currentUser ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isScrolled
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-white hover:bg-white/20"
                    } ${isActiveLink("/admin")}`}
                  >
                    Admin Dasbor
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  } ${isActiveLink("/profile")}`}
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isScrolled
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white text-red-600 hover:bg-red-50"
                  }`}
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isScrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${
            isOpen ? "block" : "hidden"
          } bg-white shadow-lg rounded-lg mt-2`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isActiveLink("/")}`}
            >
              Beranda
            </Link>
            <Link
              to="/products"
              className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isActiveLink("/products")}`}
            >
              Produk
            </Link>
            {currentUser && !isAdmin && (
              <Link
                to="/cart"
                className={`relative block px-3 py-2 rounded-md font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isActiveLink("/cart")}`}
              >
                <span className="flex items-center">
                  Keranjang
                  {getCartItemCount() > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {currentUser ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                      isScrolled
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${isActiveLink("/admin")}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${isActiveLink("/profile")}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                    isScrolled
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isScrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
