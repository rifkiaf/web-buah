import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/helpers";
import Card from "../components/ui/Card";

const MyOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", currentUser.uid)
          // orderBy("createdAt", "desc") // This requires a composite index. We will sort on the client instead.
        );

        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort the orders on the client-side, similar to the admin dashboard
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">
          Anda belum memiliki pesanan.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order ID: {order.id}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tanggal: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      order.status === "paid" || order.status === "settlement"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-2">Detail Pesanan:</h3>
                  {order.cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-gray-700">
                        {item.name} (x{item.quantity})
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || order.total - (order.shipping?.cost || 0) )}</span>
                  </div>
                  {order.shipping && (
                    <div className="flex justify-between items-center py-2 font-semibold">
                      <span>Pengiriman ({order.shipping.option.split(" (")[0]})</span>
                      <span>{formatCurrency(order.shipping.cost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 text-lg font-bold border-t mt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders; 