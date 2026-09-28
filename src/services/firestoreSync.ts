import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { ServiceListing, TaskRequest, Order, Message, UserProfile } from '../types';

export async function syncCloudConnection() {
  return await testConnection();
}

// User Profiles
export async function syncUserProfileToCloud(user: UserProfile) {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.warn('Syncing user profile to cloud warning:', error);
  }
}

// Service Listings
export async function syncServiceToCloud(service: ServiceListing) {
  try {
    const serviceRef = doc(db, 'services', service.id);
    await setDoc(serviceRef, service, { merge: true });
  } catch (error) {
    console.warn('Syncing service to cloud warning:', error);
  }
}

export async function fetchServicesFromCloud(): Promise<ServiceListing[]> {
  try {
    const q = query(collection(db, 'services'));
    const snapshot = await getDocs(q);
    const services: ServiceListing[] = [];
    snapshot.forEach((d) => {
      services.push(d.data() as ServiceListing);
    });
    return services;
  } catch (error) {
    console.warn('Fetching services from cloud warning:', error);
    return [];
  }
}

// Service Requests
export async function syncRequestToCloud(req: TaskRequest) {
  try {
    const reqRef = doc(db, 'requests', req.id);
    await setDoc(reqRef, req, { merge: true });
  } catch (error) {
    console.warn('Syncing request to cloud warning:', error);
  }
}

export async function fetchRequestsFromCloud(): Promise<TaskRequest[]> {
  try {
    const q = query(collection(db, 'requests'));
    const snapshot = await getDocs(q);
    const requests: TaskRequest[] = [];
    snapshot.forEach((d) => {
      requests.push(d.data() as TaskRequest);
    });
    return requests;
  } catch (error) {
    console.warn('Fetching requests from cloud warning:', error);
    return [];
  }
}

// Orders
export async function syncOrderToCloud(order: Order) {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, order, { merge: true });
  } catch (error) {
    console.warn('Syncing order to cloud warning:', error);
  }
}

export async function fetchOrdersFromCloud(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      orders.push(d.data() as Order);
    });
    return orders;
  } catch (error) {
    console.warn('Fetching orders from cloud warning:', error);
    return [];
  }
}

// Messages
export async function syncMessageToCloud(orderId: string, message: Message) {
  try {
    const msgRef = doc(db, 'orders', orderId, 'messages', message.id);
    await setDoc(msgRef, message, { merge: true });
  } catch (error) {
    console.warn('Syncing message to cloud warning:', error);
  }
}
