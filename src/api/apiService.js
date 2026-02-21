/**
 * API Configuration for BinIQ React Native App
 * Backend Server IP: 192.168.29.162
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
// const API_BASE_URL = 'http://10.45.4.75:3001';
const API_BASE_URL = 'https://biniq.onrender.com';

// API Configuration
const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Get authentication token from AsyncStorage
const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Set authentication token in AsyncStorage
const setAuthToken = async token => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Remove authentication token
const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Build headers with authentication if token exists
const buildHeaders = async (customHeaders = {}) => {
  const headers = {...API_CONFIG.headers, ...customHeaders};

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Handle API response
const handleResponse = async response => {
  const contentType = response.headers.get('content-type');

  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = {
      status: response.status,
      message: data.message || data.error || 'An error occurred',
      data: data,
    };

    throw error;
  }

  return data;
};

// Generic API request function
const apiRequest = async (url, options = {}) => {
  const headers = await buildHeaders(options.headers);
  const config = {
    ...options,
    headers,
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
};

// HTTP Methods
const apiService = {
  // GET request
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return apiRequest(fullUrl, {
      method: 'GET',
    });
  },

  // POST request
  post: async (url, data = {}) => {
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put: async (url, data = {}) => {
    return apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete: async (url, data = {}) => {
    return apiRequest(url, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch: async (url, data = {}) => {
    return apiRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// API Endpoints
const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/api/users/register`,
    login: `${API_BASE_URL}/api/users/login`,
    forgotPassword: `${API_BASE_URL}/api/users/forgot-password`,
    verifyOTP: `${API_BASE_URL}/api/users/verify-otp`,
    resetPassword: `${API_BASE_URL}/api/users/reset-password`,
  },

  // User Management
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    updateProfile: `${API_BASE_URL}/api/users/profile`,
    changePassword: `${API_BASE_URL}/api/users/change-password`,
    deleteAccount: `${API_BASE_URL}/api/users/delete-account`, // ✅ UPDATED to match your backend
    approve: `${API_BASE_URL}/api/users/approve`,
    reject: `${API_BASE_URL}/api/users/reject`,
  },

  // Feedback
  feedback: {
    submit: `${API_BASE_URL}/api/users/feedback`,
    get: `${API_BASE_URL}/api/users/feedback`,
    reply: `${API_BASE_URL}/api/users/feedback/reply`,
  },

  // Products
  products: {
    create: `${API_BASE_URL}/api/products`,
    getAll: `${API_BASE_URL}/api/products`,
    getTrending: `${API_BASE_URL}/api/products/trending`,
    getActivity: `${API_BASE_URL}/api/products/activity`,
    getById: id => `${API_BASE_URL}/api/products/${id}`,
    update: id => `${API_BASE_URL}/api/products/${id}`,
    delete: id => `${API_BASE_URL}/api/products/${id}`,
  },

  // Categories
  categories: {
    create: `${API_BASE_URL}/api/categories`,
    getAll: `${API_BASE_URL}/api/categories`,
  },

  // Stores
  stores: {
    create: `${API_BASE_URL}/api/stores`,
    getAll: `${API_BASE_URL}/api/stores`,
    getMyStore: `${API_BASE_URL}/api/stores/my-store`,
    update: `${API_BASE_URL}/api/stores`,
    view: `${API_BASE_URL}/api/stores/view`,
    like: `${API_BASE_URL}/api/stores/like`,
    follow: `${API_BASE_URL}/api/stores/follow`,
    comment: `${API_BASE_URL}/api/stores/comment`,
    getDetails: id => `${API_BASE_URL}/api/stores/details/${id}`,
    favorite: `${API_BASE_URL}/api/stores/favorite`,
    getFavorites: `${API_BASE_URL}/api/stores/favorites`,
    getUserFavorites: userId =>
      `${API_BASE_URL}/api/stores/favorites/${userId}`,
    getNearby: `${API_BASE_URL}/api/stores/nearby`,
  },

  // Promotions
  promotions: {
    create: `${API_BASE_URL}/api/promotions`,
    getAll: `${API_BASE_URL}/api/promotions`,
    update: id => `${API_BASE_URL}/api/promotions/${id}`,
    delete: id => `${API_BASE_URL}/api/promotions/${id}`,
  },

  // Subscriptions
  subscriptions: {
    getTiers: `${API_BASE_URL}/api/subscriptions/tiers`,
    updateTiers: `${API_BASE_URL}/api/subscriptions/tiers`,
    subscribe: `${API_BASE_URL}/api/subscriptions/subscribe`,
    getAll: `${API_BASE_URL}/api/subscriptions`,
    cancel: `${API_BASE_URL}/api/subscriptions/cancel`,
  },

  // Notifications
  notifications: {
    create: `${API_BASE_URL}/api/notifications`,
    getAll: `${API_BASE_URL}/api/notifications`,
    markAsRead: id => `${API_BASE_URL}/api/notifications/${id}/read`,
  },

  // FAQs
  faqs: {
    create: `${API_BASE_URL}/api/faqs`,
    getAll: `${API_BASE_URL}/api/faqs`,
    update: id => `${API_BASE_URL}/api/faqs/${id}`,
    delete: id => `${API_BASE_URL}/api/faqs/${id}`,
  },

  // Statistics (Admin)
  stats: {
    paidUsers: `${API_BASE_URL}/api/stats/paid-users`,
    storeOwners: `${API_BASE_URL}/api/stats/store-owners`,
    resellers: `${API_BASE_URL}/api/stats/resellers`,
    revenue: `${API_BASE_URL}/api/stats/revenue`,
    recentActivity: `${API_BASE_URL}/api/stats/recent-activity`,
    recentFeedbacks: `${API_BASE_URL}/api/stats/recent-feedbacks`,
    quickStats: `${API_BASE_URL}/api/stats/quick-stats`,
  },
};

/**
 * Authentication API calls
 */
export const authAPI = {
  register: data => apiService.post(API_ENDPOINTS.auth.register, data),

  login: async data => {
    const response = await apiService.post(API_ENDPOINTS.auth.login, data);
    if (response.token) {
      await setAuthToken(response.token);
    }
    return response;
  },

  logout: async () => {
    await removeAuthToken();
  },

  forgotPassword: data =>
    apiService.post(API_ENDPOINTS.auth.forgotPassword, data),

  verifyOTP: data => apiService.post(API_ENDPOINTS.auth.verifyOTP, data),

  resetPassword: data =>
    apiService.post(API_ENDPOINTS.auth.resetPassword, data),
};

/**
 * User API calls
 */
export const userAPI = {
  getProfile: () => apiService.get(API_ENDPOINTS.users.profile),

  updateProfile: data =>
    apiService.put(API_ENDPOINTS.users.updateProfile, data),

  changePassword: data =>
    apiService.post(API_ENDPOINTS.users.changePassword, data),

  // ✅ UPDATED: Works with your backend /delete-account endpoint
  deleteAccount: async () => {
    try {
      console.log('🗑️ Fetching user profile to get user_id...');

      // Get current user's profile to get their ID
      const profile = await apiService.get(API_ENDPOINTS.users.profile);
      const userId = profile._id;

      console.log('🗑️ Deleting account for user:', userId);

      // Call your backend endpoint with user_id in body
      const response = await apiService.delete(
        API_ENDPOINTS.users.deleteAccount,
        {
          user_id: userId,
        },
      );

      console.log('✅ Delete response:', response);

      return response;
    } catch (error) {
      console.error('❌ Delete account error:', error);
      throw error;
    }
  },

  approveStoreOwner: userId =>
    apiService.post(API_ENDPOINTS.users.approve, {user_id: userId}),

  rejectStoreOwner: userId =>
    apiService.post(API_ENDPOINTS.users.reject, {user_id: userId}),
};

/**
 * Feedback API calls
 */
export const feedbackAPI = {
  submit: data => apiService.post(API_ENDPOINTS.feedback.submit, data),

  getAll: () => apiService.get(API_ENDPOINTS.feedback.get),

  reply: (feedbackId, reply) =>
    apiService.post(API_ENDPOINTS.feedback.reply, {
      feedback_id: feedbackId,
      reply: reply,
    }),
};

/**
 * Products API calls
 */
export const productsAPI = {
  create: data => apiService.post(API_ENDPOINTS.products.create, data),

  getAll: params => apiService.get(API_ENDPOINTS.products.getAll, params),

  getTrending: () => apiService.get(API_ENDPOINTS.products.getTrending),

  getActivity: () => apiService.get(API_ENDPOINTS.products.getActivity),

  getById: id => apiService.get(API_ENDPOINTS.products.getById(id)),

  update: (id, data) => apiService.put(API_ENDPOINTS.products.update(id), data),

  delete: id => apiService.delete(API_ENDPOINTS.products.delete(id)),
};

/**
 * Categories API calls
 */
export const categoriesAPI = {
  create: data => apiService.post(API_ENDPOINTS.categories.create, data),

  getAll: () => apiService.get(API_ENDPOINTS.categories.getAll),
};

/**
 * Stores API calls
 */
export const storesAPI = {
  create: data => apiService.post(API_ENDPOINTS.stores.create, data),

  getAll: params => apiService.get(API_ENDPOINTS.stores.getAll, params),

  getMyStore: () => apiService.get(API_ENDPOINTS.stores.getMyStore),

  update: data => apiService.put(API_ENDPOINTS.stores.update, data),

  view: storeId =>
    apiService.post(API_ENDPOINTS.stores.view, {store_id: storeId}),

  like: storeId =>
    apiService.post(API_ENDPOINTS.stores.like, {store_id: storeId}),

  follow: storeId =>
    apiService.post(API_ENDPOINTS.stores.follow, {store_id: storeId}),

  comment: (storeId, comment) =>
    apiService.post(API_ENDPOINTS.stores.comment, {
      store_id: storeId,
      comment: comment,
    }),

  getDetails: id => apiService.get(API_ENDPOINTS.stores.getDetails(id)),

  favorite: storeId =>
    apiService.post(API_ENDPOINTS.stores.favorite, {store_id: storeId}),

  getFavorites: () => apiService.get(API_ENDPOINTS.stores.getFavorites),

  getUserFavorites: userId =>
    apiService.get(API_ENDPOINTS.stores.getUserFavorites(userId)),

  getNearby: (latitude, longitude, radius = 10) =>
    apiService.get(API_ENDPOINTS.stores.getNearby, {
      latitude,
      longitude,
      radius,
    }),
};

/**
 * Promotions API calls
 */
export const promotionsAPI = {
  create: data => apiService.post(API_ENDPOINTS.promotions.create, data),

  getAll: () => apiService.get(API_ENDPOINTS.promotions.getAll),

  update: (id, data) =>
    apiService.put(API_ENDPOINTS.promotions.update(id), data),

  delete: id => apiService.delete(API_ENDPOINTS.promotions.delete(id)),
};

/**
 * Subscriptions API calls
 */
export const subscriptionsAPI = {
  getTiers: () => apiService.get(API_ENDPOINTS.subscriptions.getTiers),

  updateTiers: data =>
    apiService.put(API_ENDPOINTS.subscriptions.updateTiers, data),

  subscribe: (planId, paymentMethod, billingDetails) =>
    apiService.post(API_ENDPOINTS.subscriptions.subscribe, {
      plan_id: planId,
      payment_method: paymentMethod,
      billing_details: billingDetails,
    }),

  getAll: () => apiService.get(API_ENDPOINTS.subscriptions.getAll),

  cancel: (subscriptionId, reason, feedback) =>
    apiService.post(API_ENDPOINTS.subscriptions.cancel, {
      subscription_id: subscriptionId,
      cancellation_reason: reason,
      feedback: feedback,
    }),
};

/**
 * Notifications API calls
 */
export const notificationsAPI = {
  create: data => apiService.post(API_ENDPOINTS.notifications.create, data),

  getAll: params => apiService.get(API_ENDPOINTS.notifications.getAll, params),

  markAsRead: id => apiService.put(API_ENDPOINTS.notifications.markAsRead(id)),
};

/**
 * FAQs API calls
 */
export const faqsAPI = {
  create: data => apiService.post(API_ENDPOINTS.faqs.create, data),

  getAll: params => apiService.get(API_ENDPOINTS.faqs.getAll, params),

  update: (id, data) => apiService.put(API_ENDPOINTS.faqs.update(id), data),

  delete: id => apiService.delete(API_ENDPOINTS.faqs.delete(id)),
};

/**
 * Statistics API calls (Admin only)
 */
export const statsAPI = {
  getPaidUsers: () => apiService.get(API_ENDPOINTS.stats.paidUsers),

  getStoreOwners: () => apiService.get(API_ENDPOINTS.stats.storeOwners),

  getResellers: () => apiService.get(API_ENDPOINTS.stats.resellers),

  getRevenue: params => apiService.get(API_ENDPOINTS.stats.revenue, params),

  getRecentActivity: params =>
    apiService.get(API_ENDPOINTS.stats.recentActivity, params),

  getRecentFeedbacks: params =>
    apiService.get(API_ENDPOINTS.stats.recentFeedbacks, params),

  getQuickStats: () => apiService.get(API_ENDPOINTS.stats.quickStats),
};

// Export utility functions
export {getAuthToken, setAuthToken, removeAuthToken};

// Export configuration
export {API_CONFIG, API_ENDPOINTS, API_BASE_URL};

// Default export
export default apiService;
