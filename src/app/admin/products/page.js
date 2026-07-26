'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    offer: '',
    category: 'Shirts',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    images: [''],
    stock: 10,
    isFeatured: false,
  });

  const categories = ['Shirts', 'Pants', 'Jackets', 'Dresses', 'Hoodies', 'Accessories'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Fetch product catalog
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open Modal for Creating or Editing
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price ?? '',
        offer: product.offer ?? '',
        category: product.category || 'Shirts',
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images?.length > 0 ? product.images : [''],
        stock: product.stock ?? 0,
        isFeatured: product.isFeatured || false,
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        price: '',
        offer: '',
        category: 'Shirts',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White'],
        images: [''],
        stock: 10,
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  // Convert File to Base64 String
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        images: [reader.result],
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      offer: form.offer !== '' && form.offer != null ? Number(form.offer) : 0,
      category: form.category,
      stock: Number(form.stock) || 0,
      sizes: form.sizes,
      colors: typeof form.colors === 'string' ? form.colors.split(',').map((c) => c.trim()) : form.colors,
      images: form.images.filter((img) => img.trim() !== ''),
      isFeatured: form.isFeatured || false,
    };

    const endpoint = '/api/admin/products';
    const method = editingId ? 'PUT' : 'POST';
    if (editingId) payload.id = editingId;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error submitting product form');
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const toggleSize = (sz) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(sz)
        ? prev.sizes.filter((s) => s !== sz)
        : [...prev.sizes, sz],
    }));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Add, edit, or manage store inventory items.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20 text-xs sm:text-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-8 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6 bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-500 text-xs font-semibold">Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Offer (%)</th>
                  <th className="py-4 px-4">Stock Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((prod) => {
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;
                  const isOutOfStock = prod.stock === 0;

                  const rawPrice = Number(prod.price) || 0;
                  const rawOffer = Number(prod.offer) || 0;
                  const hasOffer = rawOffer > 0;

                  const finalPrice = hasOffer
                    ? rawPrice - (rawPrice * rawOffer) / 100
                    : rawPrice;

                  return (
                    <tr
                      key={prod._id}
                      className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200/60 shrink-0">
                            <img
                              src={prod.images?.[0] || 'https://via.placeholder.com/50'}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">
                              {prod.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 font-normal max-w-xs mt-0.5">
                              {prod.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/60">
                          {prod.category}
                        </span>
                      </td>

                      {/* Clean Price Column */}
                      <td className="py-4 px-4 whitespace-nowrap font-black text-gray-900">
                        <div className="flex items-baseline space-x-1.5">
                          <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                          {hasOffer && (
                            <span className="text-xs font-bold text-gray-400 line-through">
                              ₹{rawPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Clean Offer Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {hasOffer ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
                            {rawOffer}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">No Offer</span>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            {prod.stock} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            {prod.stock} in stock
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenModal(prod)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Minimalist Oxford Cotton Shirt"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of item features and materials..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Grid: PRICE, OFFER (%), CATEGORY, STOCK COUNT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="699.00"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Offer (%) <span className="text-[10px] text-gray-400 font-normal">(Opt)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={form.offer}
                    onChange={(e) => setForm({ ...form, offer: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                        form.sizes.includes(sz)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Colors (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black, White, Navy"
                  value={Array.isArray(form.colors) ? form.colors.join(', ') : form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Photo Upload Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Product Photo
                </label>
                
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    {form.images[0] ? (
                      <img
                        src={form.images[0]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-600 rounded-2xl p-4 cursor-pointer transition bg-gray-50/50 hover:bg-indigo-50/30 group">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mb-1 transition" />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition">
                      Click to upload image file
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}