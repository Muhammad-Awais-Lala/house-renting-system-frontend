import axios, { AxiosError } from 'axios';

// Create axios instance with base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('houseintel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      localStorage.removeItem('houseintel_token');
      localStorage.removeItem('houseintel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============== USER SERVICE ==============
export const userService = {
  // Register new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'tenant' | 'landlord' | 'admin';
  }) => {
    return api.post('/users/register', userData);
  },

  // Login user
  login: async (email: string, password: string) => {
    return api.post('/users/login', { email, password });
  },

  // Get user profile
  getProfile: async (userId: string) => {
    return api.get(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: any) => {
    return api.put(`/users/${userId}`, profileData);
  },

  // Get all users (Admin only)
  getAll: async () => {
    return api.get('/users');
  },

  // Get users by role
  getByRole: async (role: 'tenant' | 'landlord' | 'admin') => {
    return api.get(`/users/role/${role}`);
  },

  // Delete user (Admin only)
  delete: async (userId: string) => {
    return api.delete(`/users/${userId}`);
  },
};

// ============== PROPERTY SERVICE ==============
export const propertyService = {
  // Get all properties with optional filters
  getAll: async (filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get('/properties', { params: filters });
  },

  // Get property by ID
  getById: async (propertyId: string) => {
    return api.get(`/properties/${propertyId}`);
  },

  // Get landlord's properties
  getLandlordProperties: async (landlordId: string) => {
    return api.get(`/properties/landlord/${landlordId}`);
  },

  // Create new property (Landlord only)
  // Sends JSON when no files — backend reads from req.body (no multer needed)
  // Pass files[] only if you want Cloudinary uploads
  create: async (propertyData: any, files?: File[]) => {
    if (files && files.length > 0) {
      // Multipart upload with actual image files
      const formData = new FormData();
      Object.keys(propertyData).forEach((key) => {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach((item: any) => {
            formData.append(key, item);
          });
        } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
          formData.append(key, propertyData[key]);
        }
      });
      files.forEach((file) => formData.append('images', file));
      return api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // No files — send as plain JSON (default path)
    return api.post('/properties', propertyData);
  },

  // Update property (Landlord only)
  // Sends multipart when there are new images to upload or existing ones to delete.
  update: async (
    propertyId: string,
    propertyData: any,
    newFiles?: File[],
    deletedPublicIds?: string[],
  ) => {
    const hasFiles = newFiles && newFiles.length > 0;
    const hasDeletions = deletedPublicIds && deletedPublicIds.length > 0;

    if (hasFiles || hasDeletions) {
      const formData = new FormData();

      // Append scalar / array fields
      Object.keys(propertyData).forEach((key) => {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach((item: any) => formData.append(key, item));
        } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
          formData.append(key, propertyData[key]);
        }
      });

      // New image files
      if (hasFiles) {
        newFiles!.forEach((file) => formData.append('images', file));
      }

      // Public IDs to delete from Cloudinary
      if (hasDeletions) {
        deletedPublicIds!.forEach((pid) => formData.append('deletedPublicIds', pid));
      }

      return api.put(`/properties/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Pure metadata edit — no image changes
    return api.put(`/properties/${propertyId}`, propertyData);
  },

  // Delete property (Landlord only)
  delete: async (propertyId: string) => {
    return api.delete(`/properties/${propertyId}`);
  },

  // Delete property image
  deleteImage: async (propertyId: string, imageIndex: number) => {
    return api.delete(`/properties/${propertyId}/images/${imageIndex}`);
  },
};

// ============== BOOKING SERVICE ==============
export const bookingService = {
  // Get bookings for current user
  getAll: async (filters?: { status?: string; page?: number; limit?: number }) => {
    return api.get('/bookings', { params: filters });
  },

  // Get booking by ID
  getById: async (bookingId: string) => {
    return api.get(`/bookings/${bookingId}`);
  },

  // Get bookings for a property (Landlord only)
  getPropertyBookings: async (propertyId: string) => {
    return api.get(`/bookings/property/${propertyId}`);
  },

  // Create booking request (Tenant only)
  create: async (bookingData: {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    message?: string;
  }) => {
    return api.post('/bookings', bookingData);
  },

  // Accept booking (Landlord only)
  accept: async (bookingId: string) => {
    return api.put(`/bookings/${bookingId}/accept`);
  },

  // Reject booking (Landlord only)
  reject: async (bookingId: string) => {
    return api.put(`/bookings/${bookingId}/reject`);
  },

  // Cancel booking (Tenant only)
  cancel: async (bookingId: string) => {
    return api.put(`/bookings/${bookingId}/cancel`);
  },
};

// ============== REVIEW SERVICE ==============
export const reviewService = {
  // Get reviews for a property
  getPropertyReviews: async (propertyId: string, page?: number, limit?: number) => {
    return api.get(`/reviews/property/${propertyId}`, { params: { page, limit } });
  },

  // Get reviews for a tenant
  getTenantReviews: async (tenantId: string) => {
    return api.get(`/reviews/tenant/${tenantId}`);
  },

  // Get review by ID
  getById: async (reviewId: string) => {
    return api.get(`/reviews/${reviewId}`);
  },

  // Create review (Tenant only)
  create: async (reviewData: {
    propertyId: string;
    rating: number;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
  }) => {
    return api.post('/reviews', reviewData);
  },

  // Update review (Tenant only)
  update: async (reviewId: string, reviewData: any) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  // Delete review (Tenant only)
  delete: async (reviewId: string) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string) => {
    return api.put(`/reviews/${reviewId}/helpful`);
  },
};

// ============== RECOMMENDATION SERVICE ==============
export const recommendationService = {
  // Get AI-based recommendations
  getRecommendations: async (preferences: any) => {
    return api.post('/recommendations', preferences);
  },

  // Filter properties based on criteria
  filterProperties: async (filters: any) => {
    return api.post('/recommendations/filter', filters);
  },
};

// ============== CHAT SERVICE ==============
export const chatService = {
  // Get user chats
  getUserChats: async (userId: string) => {
    return api.get(`/chats/user/${userId}`);
  },

  // Send a message
  sendMessage: async (chatId: string, message: any) => {
    return api.post(`/chats/${chatId}/messages`, message);
  },
};

export default api;
