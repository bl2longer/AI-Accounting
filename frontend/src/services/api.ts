import axios from 'axios';

// Base URL for API requests
// This will be updated with the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints for expenses
export const expenseApi = {
  // Get all expenses with optional filtering
  getExpenses: async (params?: {
    skip?: number;
    limit?: number;
    merchant?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Get a specific expense by ID
  getExpense: async (id: number) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create a new expense
  createExpense: async (expenseData: any) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update an expense
  updateExpense: async (id: number, expenseData: any) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (id: number) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expense summary report
  getExpenseSummary: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get('/expenses/summary/report', { params });
    return response.data;
  },

  // Get list of categories
  getCategories: async () => {
    const response = await api.get('/expenses/categories/list');
    return response.data;
  },

  // Get list of merchants
  getMerchants: async () => {
    const response = await api.get('/expenses/merchants/list');
    return response.data;
  },
};

// API endpoints for recognition
export const recognitionApi = {
  // Process input data (image, voice, text)
  processInput: async (inputType: 'image' | 'voice' | 'text', file?: File, textContent?: string) => {
    const formData = new FormData();
    formData.append('input_type', inputType);
    
    if (file) {
      formData.append('file', file);
    }
    
    if (textContent) {
      formData.append('text_content', textContent);
    }
    
    const response = await api.post('/recognition/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Test OpenRouter.ai API
  testOpenRouter: async () => {
    const response = await api.get('/recognition/test');
    return response.data;
  },
};

export default api;
