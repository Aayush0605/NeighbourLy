import { ServiceListing, TaskRequest, Order, Message } from '../types';

const SERVICES_STORAGE_KEY = 'neighborly_services';
const REQUESTS_STORAGE_KEY = 'neighborly_requests';
const ORDERS_STORAGE_KEY = 'neighborly_orders';
const MESSAGES_STORAGE_KEY = 'neighborly_messages';

/**
 * Site starts with NO dummy data as instructed.
 * All data is real and created by the user or their neighbors in localStorage.
 */
export function getStoredServices(): ServiceListing[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading services from storage', e);
  }
  return [];
}

export function saveStoredServices(services: ServiceListing[]) {
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
}

export function getStoredRequests(): TaskRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading requests from storage', e);
  }
  return [];
}

export function saveStoredRequests(requests: TaskRequest[]) {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading orders from storage', e);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function getStoredMessages(): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading messages from storage', e);
  }
  return [];
}

export function saveStoredMessages(messages: Message[]) {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}
