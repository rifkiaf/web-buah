import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { PRODUCT_CATEGORIES } from "../../utils/constants";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";

const ProductForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        image: product.image || "",
      });
    }
  }, [product]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nama produk harus diisi";
    if (!formData.category) errors.category = "Kategori harus dipilih";
    if (!formData.price || formData.price <= 0) errors.price = "Harga harus lebih dari 0";
    if (!formData.stock || formData.stock < 0) errors.stock = "Stok tidak boleh negatif";
    if (!formData.description.trim()) errors.description = "Deskripsi harus diisi";
    if (!formData.image) errors.image = "Gambar produk harus diunggah";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setError("");

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "buah_upload");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dtaeoc9tu/image/upload",
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Gagal mengunggah gambar");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        image: data.secure_url,
      }));

      if (validationErrors.image) {
        setValidationErrors((prev) => ({ ...prev, image: "" }));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message || "Gagal mengunggah gambar.");
      setValidationErrors((prev) => ({
        ...prev,
        image: "Gagal mengunggah gambar.",
      }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
        image: formData.image.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (product) {
        // Update existing product
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, productData);
      } else {
        // Add new product
        productData.createdAt = new Date().toISOString();
        const productsRef = collection(db, "products");
        await addDoc(productsRef, productData);
      }

      onSubmit();
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Produk"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={validationErrors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  validationErrors.category ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                required
              >
                <option value="">Pilih Kategori</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
              )}
            </div>

            <Input
              label="Harga"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={validationErrors.price}
              required
            />

            <Input
              label="Stok"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={validationErrors.stock}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 rounded-md border ${
                validationErrors.description
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              required
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Produk
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:bg-green-600 file:text-white file:border-none file:px-4 file:py-2 file:mr-4"
              disabled={imageUploading}
            />
            {imageUploading && (
              <p className="mt-1 text-sm text-gray-500">
                Mengunggah gambar...
              </p>
            )}
            {validationErrors.image && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.image}
              </p>
            )}
            {formData.image && !imageUploading && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150?text=Gambar+Tidak+Tersedia";
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading || imageUploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || imageUploading}>
              {loading
                ? "Menyimpan..."
                : product
                ? "Update Produk"
                : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm; 