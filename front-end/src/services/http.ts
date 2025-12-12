// src/services/http.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Tự động detect IP từ Expo dev server
const getBaseUrl = () => {
  const expoHostUri = Constants.expoConfig?.hostUri;
  if (expoHostUri) {
    const ip = expoHostUri.split(':')[0];
    const url = `http://${ip}:3001`;
    console.log('🌐 API Base URL:', url);
    return url;
  }
  console.log('🌐 API Base URL: http://localhost:3001 (fallback)');
  return 'http://localhost:3001';
};

const BASE_URL = getBaseUrl();
console.log('📡 HTTP Service initialized with BASE_URL:', BASE_URL);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  json?: Record<string, any>;
  params?: Record<string, any>;
  skipAuth?: boolean;
}

class Http {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Có thể thực hiện refresh token ở đây
          await this.clearTokens();
        }
        return Promise.reject(error);
      }
    );
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', json, params, skipAuth = false } = options;

    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      params,
      data: json,
    };

    if (skipAuth) {
      config.headers = { ...config.headers };
      delete config.headers?.Authorization;
    }

    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Request failed';
      throw new Error(message);
    }
  }
}

export const http = new Http();
