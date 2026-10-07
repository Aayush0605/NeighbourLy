import { ServiceListing, TaskRequest, Order, Message } from '../types';

const SERVICES_STORAGE_KEY = 'neighborly_services_v2';
const REQUESTS_STORAGE_KEY = 'neighborly_requests_v2';
const ORDERS_STORAGE_KEY = 'neighborly_orders_v2';
const MESSAGES_STORAGE_KEY = 'neighborly_messages_v2';

// Automatically purge legacy demo/dummy data keys from older builds
try {
  const legacyKeys = [
    'neighborly_orders_clean_v1',
    'neighborly_messages_clean_v1',
    'neighborly_services_clean_v1',
    'neighborly_requests_clean_v1',
    'neighborly_orders',
    'neighborly_messages',
    'neighborly_demo_orders',
    'neighborly_conversations',
    'neighborly_mock_orders',
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
} catch (e) {}

// Strict zero-dummy-data defaults
export const DEFAULT_SERVICES: ServiceListing[] = [];
export const DEFAULT_REQUESTS: TaskRequest[] = [];
export const DEFAULT_ORDERS: Order[] = [];
export const DEFAULT_MESSAGES: Message[] = [];

export const clearAllStoredHistory = (): void => {
  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    localStorage.removeItem(SERVICES_STORAGE_KEY);
    localStorage.removeItem(REQUESTS_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing stored history', err);
  }
};

export const getStoredServices = (): ServiceListing[] => {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredServices = (services: ServiceListing[]): void => {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (err) {
    console.warn('Error saving services to localStorage', err);
  }
};

export const getStoredRequests = (): TaskRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredRequests = (requests: TaskRequest[]): void => {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.warn('Error saving requests to localStorage', err);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Error saving orders to localStorage', err);
  }
};

export const getStoredMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredMessages = (messages: Message[]): void => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('Error saving messages to localStorage', err);
  }
};
