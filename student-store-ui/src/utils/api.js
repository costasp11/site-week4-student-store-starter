import axios from 'axios';

// API base URL - your backend server
const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API calls
export const productsAPI = {
  // Get all products with optional filtering and sorting
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Orders API calls
export const ordersAPI = {
  // Get all orders
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get order by ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Update order
  update: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Delete order
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Add items to existing order
  addItems: async (orderId, orderItems) => {
    const response = await api.post(`/orders/${orderId}/items`, { orderItems });
    return response.data;
  },

  // Get order total
  getTotal: async (id) => {
    const response = await api.get(`/orders/${id}/total`);
    return response.data;
  },
};

export default api; 