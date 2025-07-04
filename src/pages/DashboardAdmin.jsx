import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { ROUTES, PRODUCT_CATEGORIES } from "../utils/constants";
import { formatCurrency } from "../utils/helpers";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProductForm from "../components/admin/ProductForm";

const DashboardAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Tambahan untuk transaksi
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    console.log(
      "DashboardAdmin mounted, fetching products and transactions..."
    );
    fetchProducts();
    fetchTransactions(); // Memanggil data transaksi
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products from Firestore...");
      const productsRef = collection(db, "products");
      console.log("Products collection reference:", productsRef);

      const querySnapshot = await getDocs(productsRef);
      console.log("Query snapshot received:", querySnapshot.size, "documents");

      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Products list:", productsList);

      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Gagal mengambil data produk: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi mengambil transaksi
  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions from Firestore...");
      const transactionsRef = collection(db, "transactions");
      const querySnapshot = await getDocs(transactionsRef);
      console.log("Transactions snapshot:", querySnapshot.size, "documents");

      const transactionsList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 🔥 Sorting by ISO date

      setTransactions(transactionsList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Gagal mengambil data transaksi: " + error.message);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        console.log("Deleting product:", productId);
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        console.log("Product deleted successfully");

        setProducts(products.filter((product) => product.id !== productId));
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Gagal menghapus produk: " + error.message);
      }
    }
  };

  const handleEdit = (product) => {
    console.log("Editing product:", product);
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    console.log("Adding new product");
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    console.log("Closing product form");
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = () => {
    console.log("Product form submitted, refreshing products list");
    fetchProducts();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dasbor</h1>
        <Button onClick={handleAddNew}>Tambah Produk</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gambar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Daftar Transaksi</h2>
      <Card>
        <div className="overflow-x-auto">
          {loadingTransactions ? (
            <div className="p-4 text-center text-gray-500">
              Memuat transaksi...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Telepon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengiriman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaksi) => (
                  <tr key={transaksi.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.displayName || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.email || "Tidak ada email"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.address || "Tidak ada alamat"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.phone || "Tidak ada nomor telepon"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.cartItems &&
                        transaksi.cartItems.map((item) => (
                          <div key={item.id}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaksi.shipping ? (
                        <div className="text-sm text-gray-900">
                          {transaksi.shipping.option.split(" (")[0]}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaksi.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaksi.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaksi.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
