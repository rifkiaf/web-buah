import React from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-500 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Fruits Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-500/90"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Fresh Fruits for Your
              <span className="block text-green-100 mt-2">Healthy Lifestyle</span>
            </h1>
            <p className="text-xl text-green-50 text-center mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the finest selection of fresh fruits, carefully picked and delivered to your doorstep. 
              Experience the taste of nature's best.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-white text-green-600 hover:bg-green-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Shop Now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-transparent text-white border-2 border-white hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Fresh from Farm</h3>
              <p className="text-gray-600 leading-relaxed">Directly sourced from local farmers, ensuring the freshest and most nutritious fruits for you and your family.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Same day delivery available in selected areas. Your fruits will arrive fresh and ready to enjoy.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">100% quality guaranteed. We carefully select each fruit to ensure the best taste and freshness.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium fruits, chosen for their exceptional quality and taste.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border-2 border-green-500 text-green-500 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-colors duration-200"
            >
              View All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
