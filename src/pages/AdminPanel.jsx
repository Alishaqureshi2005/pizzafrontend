import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaImage, FaList, FaTimes } from 'react-icons/fa';
import { categoryApi, productApi } from '../services/adminApi';
import { API_URL } from '../config.js';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [menuData, setMenuData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    customization: {
      toppings: [],
      crust: [],
      size: []
    },
    calories: '',
    size: '',
    type: 'pizza',
    isVegetarian: false,
    isSpicy: false,
    isPopular: false,
    isActive: true,
    ingredients: [],
    countInStock: 100,
    newIngredient: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productApi.getProducts();
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setMenuData(response.data.data);
      } else {
        setMenuData([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMenuData([]);
      setError(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      setLoading(true);
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description
      };
      const response = await categoryApi.createCategory(categoryData);
      if (response?.data?.success && response.data.data) {
        setMenuData(prev => [...prev, response.data.data]);
        setShowCategoryForm(false);
        setNewCategory({ name: '', description: '' });
        toast.success('Category created successfully');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error.message || 'Failed to create category');
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      setLoading(true);
      const response = await categoryApi.updateCategory(categoryId, categoryData);
      if (response && response.data) {
        setMenuData(prev =>
          prev.map(cat => (cat._id === categoryId ? response.data : cat))
        );
        setShowCategoryForm(false);
        toast.success('Category updated successfully');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      await categoryApi.deleteCategory(categoryId);
      setMenuData(prev => prev.filter(cat => cat._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem({ ...newItem, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryType = () => {
    const selectedCategory = menuData.find(cat => cat._id === selectedCategoryId);
    const categoryName = selectedCategory?.name?.toLowerCase() || '';
    
    if (categoryName.includes('pasta')) return 'pasta';
    if (categoryName.includes('dessert')) return 'dessert';
    return 'pizza'; // default type
  };

  const handleCreateItem = async (categoryId, itemData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Parse price correctly, removing any non-numeric characters except decimal point
      const basePrice = parseFloat(itemData.price.replace(/[^0-9.]/g, ''));
      if (isNaN(basePrice)) {
        throw new Error('Invalid price format');
      }

      // Required fields with correct field names
      formData.append('name', itemData.name);
      formData.append('description', itemData.description);
      formData.append('basePrice', basePrice);
      formData.append('category', categoryId);
      
      // Additional fields
      formData.append('calories', parseInt(itemData.calories) || 0);
      formData.append('ingredients', JSON.stringify(itemData.ingredients || []));
      formData.append('isVegetarian', itemData.isVegetarian ? 'true' : 'false');
      formData.append('isSpicy', itemData.isSpicy ? 'true' : 'false');
      formData.append('isPopular', itemData.isPopular ? 'true' : 'false');
      formData.append('isActive', itemData.isActive ? 'true' : 'false');
      
      // Customization object with backend's expected structure
      const customization = {
        sizes: [
          { name: 'small', price: basePrice * 0.8 },
          { name: 'medium', price: basePrice },
          { name: 'large', price: basePrice * 1.2 }
        ],
        crusts: [
          { name: 'classic', price: 0 },
          { name: 'thin', price: 0 },
          { name: 'thick', price: 1 }
        ],
        maxToppings: 5,
        maxExtraItems: 3
      };
      formData.append('customization', JSON.stringify(customization));
      
      // Image handling
      if (itemData.image) {
        formData.append('image', itemData.image);
      }

      // Validate required fields
      if (!itemData.name || !itemData.description || !basePrice || !categoryId) {
        throw new Error('Please fill in all required fields');
      }

      const response = await productApi.createProduct(formData);
      if (response?.data?.success && response.data.data) {
        setMenuData(prev =>
          prev.map(cat =>
            cat._id === categoryId
              ? { ...cat, items: [...(cat.items || []), response.data.data] }
              : cat
          )
        );
        setImagePreview(null);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: '',
          image: null,
          customization: {
            toppings: [],
            crust: [],
            size: []
          },
          calories: '',
          size: '',
          type: 'pizza',
          isVegetarian: false,
          isSpicy: false,
          isPopular: false,
          isActive: true,
          ingredients: [],
          countInStock: 100,
          newIngredient: ''
        });
        toast.success('Item created successfully');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      setError(error.message || 'Failed to create menu item');
      toast.error(error.message || 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (categoryId, itemId, itemData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Parse price correctly, removing any non-numeric characters except decimal point
      const basePrice = parseFloat(itemData.price.replace(/[^0-9.]/g, ''));
      if (isNaN(basePrice)) {
        throw new Error('Invalid price format');
      }

      // Required fields with correct field names
      formData.append('name', itemData.name);
      formData.append('description', itemData.description);
      formData.append('basePrice', basePrice);
      formData.append('category', categoryId);
      
      // Additional fields
      formData.append('calories', parseInt(itemData.calories) || 0);
      formData.append('ingredients', JSON.stringify(itemData.ingredients || []));
      formData.append('isVegetarian', itemData.isVegetarian ? 'true' : 'false');
      formData.append('isSpicy', itemData.isSpicy ? 'true' : 'false');
      formData.append('isPopular', itemData.isPopular ? 'true' : 'false');
      formData.append('isActive', itemData.isActive ? 'true' : 'false');
      
      // Customization object with backend's expected structure
      const customization = {
        sizes: [
          { name: 'small', price: basePrice * 0.8 },
          { name: 'medium', price: basePrice },
          { name: 'large', price: basePrice * 1.2 }
        ],
        crusts: [
          { name: 'classic', price: 0 },
          { name: 'thin', price: 0 },
          { name: 'thick', price: 1 }
        ],
        maxToppings: 5,
        maxExtraItems: 3
      };
      formData.append('customization', JSON.stringify(customization));
      
      // Image handling
      if (itemData.image) {
        formData.append('image', itemData.image);
      }

      // Validate required fields
      if (!itemData.name || !itemData.description || !basePrice || !categoryId) {
        throw new Error('Please fill in all required fields');
      }

      const response = await productApi.updateProduct(itemId, formData);
      if (response && response.data) {
        setMenuData(prev =>
          prev.map(cat =>
            cat._id === categoryId
              ? {
                  ...cat,
                  items: cat.items.map(item =>
                    item._id === itemId ? response.data : item
                  ),
                }
              : cat
          )
        );
        setImagePreview(null);
        setEditingItem(null);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: '',
          image: null,
          customization: {
            toppings: [],
            crust: [],
            size: []
          },
          calories: '',
          size: '',
          type: 'pizza',
          isVegetarian: false,
          isSpicy: false,
          isPopular: false,
          isActive: true,
          ingredients: [],
          countInStock: 100,
          newIngredient: ''
        });
        toast.success('Item updated successfully');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('Failed to update menu item');
      toast.error(error.message || 'Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (categoryId, itemId) => {
    try {
      setLoading(true);
      const response = await productApi.deleteProduct(itemId);
      if (response?.data?.success) {
      setMenuData(prev =>
        prev.map(cat =>
          cat._id === categoryId
            ? {
                ...cat,
                items: cat.items.filter(item => item._id !== itemId),
              }
            : cat
        )
      );
        toast.success('Item deleted successfully');
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item');
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (newItem.newIngredient.trim()) {
      setNewItem(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, prev.newIngredient.trim()],
        newIngredient: ''
      }));
    }
  };

  const handleRemoveIngredient = (index) => {
    setNewItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">Admin Panel</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* Category Management */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Categories</h2>
                <button
                  onClick={() => {
                    setShowCategoryForm(!showCategoryForm);
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  {showCategoryForm ? 'Cancel' : 'Add Category'}
                </button>
              </div>

              {showCategoryForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Category name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Category description"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingCategory ? () => handleUpdateCategory(editingCategory._id, newCategory) : handleCreateCategory}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {editingCategory ? 'Update' : 'Add'} Category
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                          setNewCategory({ name: '', description: '' });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(menuData) && menuData.map((category) => (
                  <div
                    key={category._id}
                    className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setNewCategory({
                            name: category.name,
                            description: category.description || ''
                          });
                          setShowCategoryForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a Category</option>
                {Array.isArray(menuData) && menuData.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Add/Edit Item Form */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Price (e.g., €8.95)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Calories"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock Count"
                  value={newItem.countInStock}
                  onChange={(e) => setNewItem({ ...newItem, countInStock: parseInt(e.target.value) })}
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                {getCategoryType() === 'pizza' && (
                  <select
                    value={newItem.size}
                    onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                    className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                )}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newItem.isVegetarian}
                      onChange={(e) => setNewItem({ ...newItem, isVegetarian: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newItem.isSpicy}
                      onChange={(e) => setNewItem({ ...newItem, isSpicy: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Spicy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newItem.isPopular}
                      onChange={(e) => setNewItem({ ...newItem, isPopular: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Popular</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newItem.isActive}
                      onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <FaImage className="mr-2" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newItem.newIngredient}
                      onChange={(e) => setNewItem({ ...newItem, newIngredient: e.target.value })}
                      placeholder="Add ingredient"
                      className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newItem.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                      >
                        <span>{ingredient}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mt-4">
                {editingItem ? (
                  <button
                    onClick={() => handleUpdateItem(selectedCategoryId, editingItem._id, newItem)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Item
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateItem(selectedCategoryId, newItem)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    disabled={!selectedCategoryId}
                  >
                    Add Item
                  </button>
                )}
              </div>
            </div>

            {/* Items List */}
            {selectedCategoryId && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {menuData.find(cat => cat._id === selectedCategoryId)?.name} Items
                </h2>
                <div className="space-y-4">
                  {Array.isArray(menuData) && menuData
                    .find((cat) => cat._id === selectedCategoryId)
                    ?.items?.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img
                              src={`${API_URL}/uploads/${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                              {item.isPopular && (
                                <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                  Popular
                                </span>
                              )}
                              {item.isVegetarian && (
                                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                  Vegetarian
                                </span>
                              )}
                              {item.isSpicy && (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                  Spicy
                                </span>
                              )}
                              {!item.isActive && (
                                <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{item.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-red-600 font-semibold">€{item.price?.toFixed(2)}</p>
                              <p className="text-gray-500 text-sm">{item.calories} cal</p>
                              <p className="text-gray-500 text-sm">Stock: {item.countInStock}</p>
                            </div>
                            {item.ingredients?.length > 0 && (
                              <p className="text-gray-500 text-sm mt-1">
                                Ingredients: {item.ingredients.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem({ category: selectedCategoryId, itemIndex: index, ...item });
                              setNewItem({
                                name: item.name,
                                description: item.description,
                                price: `€${item.price?.toFixed(2)}`,
                                category: selectedCategoryId,
                                image: item.image,
                                customization: item.customization,
                                calories: item.calories,
                                size: item.size,
                                type: getCategoryType(),
                                isVegetarian: item.isVegetarian,
                                isSpicy: item.isSpicy,
                                isPopular: item.isPopular,
                                isActive: item.isActive,
                                ingredients: item.ingredients,
                                countInStock: item.countInStock
                              });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(selectedCategoryId, item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 