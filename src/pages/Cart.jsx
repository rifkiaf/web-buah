import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
    loading,
  } = useCart();

  const { currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // const API_BASE_URL = "https://backend-buah.vercel.app";

  const handleCheckout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/create-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.uid,
            cartItems,
            total: getCartTotal(),
          }),
        }
      );

      const data = await response.json();

      // Load Snap.js (bisa dari <script> di public/index.html)
      window.snap.pay(data.token, {
        onSuccess: async function (result) {
          console.log("Success:", result);

          // Contoh panggil API update status pembayaran
          await fetch(
            "http://localhost:5000/api/create-transaction",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                status: "paid",
              }),
            }
          );

          await clearCart();
          window.location.href = "/success";
        },
        onPending: function (result) {
          console.log("Pending:", result);
        },
        onError: function (result) {
          console.error("Error:", result);
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Keranjang Belanja
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Keranjang Anda kosong
          </h2>
          <Link
            to="/products"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Lanjutkan Berbelanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-6 border-b last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="ml-6 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-600">
                      Rp {item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span className="mx-4 text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-lg font-semibold text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ringkasan Pesanan
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    Rp {getCartTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pengiriman</span>
                  <span className="text-gray-900">Gratis</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      Rp {getCartTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={handleCheckout}
                >
                  Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
