import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query,
  updateDoc
} from 'firebase/firestore';
import { db, testConnection } from '../firebase';
import { 
  ServiceListing, 
  TaskRequest, 
  Order, 
  Message, 
  UserProfile,
  Conversation,
  AppNotification
} from '../types';

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
export async function syncServiceToCloud(service: ServiceListing): Promise<boolean> {
  try {
    const sanitizedService: ServiceListing = {
      ...service,
      id: service.id,
      providerId: service.providerId || service.provider?.id || 'provider_local',
      price: Number(service.price) || 250,
      rating: typeof service.rating === 'number' ? service.rating : 5.0,
      reviewCount: typeof service.reviewCount === 'number' ? service.reviewCount : 0,
      deliveryDays: Number(service.deliveryDays) || 1,
      title: service.title.trim().slice(0, 150),
      description: service.description.trim().slice(0, 2000),
      category: service.category || 'Academic Support',
    };

    const serviceRef = doc(db, 'services', sanitizedService.id);
    await setDoc(serviceRef, sanitizedService, { merge: true });
    return true;
  } catch (error) {
    console.warn('Syncing service to cloud warning:', error);
    return false;
  }
}

export async function deleteServiceFromCloud(serviceId: string): Promise<boolean> {
  try {
    const serviceRef = doc(db, 'services', serviceId);
    await deleteDoc(serviceRef);
    return true;
  } catch (error) {
    console.warn('Deleting service from cloud warning:', error);
    return false;
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

/**
 * Real-time listener for Services collection.
 * Any service added or deleted by ANY user immediately updates all other users!
 */
export function subscribeToServices(onUpdate: (services: ServiceListing[]) => void): () => void {
  const q = query(collection(db, 'services'));
  return onSnapshot(
    q, 
    (snapshot) => {
      const list: ServiceListing[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ServiceListing);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime services subscription warning:', err);
    }
  );
}

// Service Requests
export async function syncRequestToCloud(req: TaskRequest): Promise<boolean> {
  try {
    const sanitizedReq: TaskRequest = {
      ...req,
      id: req.id,
      requesterId: req.requesterId || 'requester_local',
      title: req.title.trim().slice(0, 150),
      description: req.description.trim().slice(0, 2000),
      budget: Number(req.budget) || 300,
      status: req.status || 'open',
    };

    const reqRef = doc(db, 'requests', sanitizedReq.id);
    await setDoc(reqRef, sanitizedReq, { merge: true });
    return true;
  } catch (error) {
    console.warn('Syncing request to cloud warning:', error);
    return false;
  }
}

export async function deleteRequestFromCloud(requestId: string): Promise<boolean> {
  try {
    const reqRef = doc(db, 'requests', requestId);
    await deleteDoc(reqRef);
    return true;
  } catch (error) {
    console.warn('Deleting request from cloud warning:', error);
    return false;
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

/**
 * Real-time listener for Task Requests collection.
 * Any request posted by ANY user immediately appears on all other users' devices!
 */
export function subscribeToRequests(onUpdate: (requests: TaskRequest[]) => void): () => void {
  const q = query(collection(db, 'requests'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: TaskRequest[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as TaskRequest);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime requests subscription warning:', err);
    }
  );
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

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  const q = query(collection(db, 'orders'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as Order);
      });
      onUpdate(orders);
    },
    (err) => {
      console.warn('Realtime orders subscription warning:', err);
    }
  );
}

// Conversation Safe Identifier Normalization
export function normalizeChatId(id: string): string {
  if (!id) return '';
  return id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export function buildDeterministicConversationId(user1Id: string, user2Id: string): string {
  const norm1 = normalizeChatId(user1Id);
  const norm2 = normalizeChatId(user2Id);
  return `conv_${[norm1, norm2].sort().join('__')}`;
}

// Conversations across different IDs
export async function syncConversationToCloud(conversation: Conversation): Promise<boolean> {
  try {
    const convRef = doc(db, 'conversations', conversation.id);
    await setDoc(convRef, conversation, { merge: true });
    return true;
  } catch (error) {
    console.warn('Syncing conversation to cloud warning:', error);
    return false;
  }
}

export async function deleteConversationFromCloud(conversationId: string): Promise<boolean> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await deleteDoc(convRef);
    return true;
  } catch (error) {
    console.warn('Deleting conversation from cloud warning:', error);
    return false;
  }
}

export async function fetchConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    const snap = await getDocs(query(collection(db, 'conversations')));
    let found: Conversation | null = null;
    snap.forEach((d) => {
      if (d.id === conversationId || d.data().id === conversationId) {
        found = d.data() as Conversation;
      }
    });
    return found;
  } catch (error) {
    console.warn('Fetching conversation warning:', error);
    return null;
  }
}

export function subscribeToConversations(
  userOrId: UserProfile | string | null | undefined,
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  const idsToMatch: string[] = [];
  if (typeof userOrId === 'string' && userOrId) {
    idsToMatch.push(userOrId.toLowerCase());
    idsToMatch.push(normalizeChatId(userOrId));
  } else if (userOrId && typeof userOrId === 'object') {
    if (userOrId.id) {
      idsToMatch.push(String(userOrId.id).toLowerCase());
      idsToMatch.push(normalizeChatId(userOrId.id));
    }
    if (userOrId.userId) {
      idsToMatch.push(String(userOrId.userId).toLowerCase());
      idsToMatch.push(normalizeChatId(userOrId.userId));
    }
    if (userOrId.email) {
      idsToMatch.push(String(userOrId.email).toLowerCase());
      idsToMatch.push(normalizeChatId(userOrId.email));
    }
    if (userOrId.name) {
      idsToMatch.push(String(userOrId.name).toLowerCase());
    }
  }

  const q = query(collection(db, 'conversations'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((d) => {
        const conv = d.data() as Conversation;
        if (!idsToMatch.length) {
          list.push(conv);
          return;
        }

        const pIds = (conv.participantIds || []).map((x) => String(x).toLowerCase());
        const participantObjValues = Object.values(conv.participants || {});

        const isMatch =
          pIds.some((pid) => idsToMatch.includes(pid) || idsToMatch.includes(normalizeChatId(pid))) ||
          participantObjValues.some((p) => {
            const pId = p.id ? String(p.id).toLowerCase() : '';
            const pEmail = p.email ? String(p.email).toLowerCase() : '';
            const pName = p.name ? String(p.name).toLowerCase() : '';
            return idsToMatch.includes(pId) || 
                   idsToMatch.includes(normalizeChatId(pId)) ||
                   (pEmail && idsToMatch.includes(pEmail)) || 
                   (pName && idsToMatch.includes(pName));
          }) ||
          idsToMatch.some((id) => id.length >= 3 && conv.id.toLowerCase().includes(id));

        if (isMatch) {
          list.push(conv);
        }
      });
      list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime conversations subscription warning:', err);
    }
  );
}

// Conversation Messages across different IDs
export async function syncConversationMessageToCloud(
  conversationId: string, 
  message: Message,
  meta?: { lastMessage: string; lastSenderId: string; lastSenderName: string }
): Promise<boolean> {
  try {
    // 1. Write the message to the subcollection
    const msgRef = doc(db, 'conversations', conversationId, 'messages', message.id);
    await setDoc(msgRef, message, { merge: true });

    // 2. Update conversation summary using setDoc with merge: true
    if (meta) {
      const convRef = doc(db, 'conversations', conversationId);
      await setDoc(
        convRef,
        {
          id: conversationId,
          lastMessage: meta.lastMessage,
          lastSenderId: meta.lastSenderId,
          lastSenderName: meta.lastSenderName,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    // 3. Also mirror to order messages if conversation is tied to an order
    if (message.orderId) {
      const orderMsgRef = doc(db, 'orders', message.orderId, 'messages', message.id);
      await setDoc(orderMsgRef, message, { merge: true });
    }

    return true;
  } catch (error) {
    console.warn('Syncing conversation message to cloud warning:', error);
    return false;
  }
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const q = query(collection(db, 'conversations', conversationId, 'messages'));
    const snap = await getDocs(q);
    const list: Message[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Message);
    });
    list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
    return list;
  } catch (e) {
    return [];
  }
}

export function subscribeToConversationMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void
): () => void {
  // Immediately fetch cached messages so UI is never blank
  fetchConversationMessages(conversationId).then((initialMsgs) => {
    if (initialMsgs.length > 0) {
      onUpdate(initialMsgs);
    }
  });

  const q = query(collection(db, 'conversations', conversationId, 'messages'));
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Message);
      });
      list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime conversation messages subscription warning:', err);
    }
  );

  // Background polling fallback every 2.0s for guaranteed delivery
  const timer = setInterval(async () => {
    const msgs = await fetchConversationMessages(conversationId);
    if (msgs.length > 0) {
      onUpdate(msgs);
    }
  }, 2000);

  return () => {
    unsub();
    clearInterval(timer);
  };
}

// Legacy/Direct order messages
export async function syncMessageToCloud(orderId: string, message: Message) {
  try {
    const msgRef = doc(db, 'orders', orderId, 'messages', message.id);
    await setDoc(msgRef, message, { merge: true });
  } catch (error) {
    console.warn('Syncing message to cloud warning:', error);
  }
}

export async function fetchOrderMessages(orderId: string): Promise<Message[]> {
  try {
    const q = query(collection(db, 'orders', orderId, 'messages'));
    const snap = await getDocs(q);
    const list: Message[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Message);
    });
    list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
    return list;
  } catch (e) {
    return [];
  }
}

export function subscribeToOrderMessages(
  orderId: string,
  onUpdate: (messages: Message[]) => void
): () => void {
  const q = query(collection(db, 'orders', orderId, 'messages'));
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Message);
      });
      list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime order messages subscription warning:', err);
    }
  );

  // Background polling fallback every 2.5s
  const timer = setInterval(async () => {
    const msgs = await fetchOrderMessages(orderId);
    if (msgs.length > 0) {
      onUpdate(msgs);
    }
  }, 2500);

  return () => {
    unsub();
    clearInterval(timer);
  };
}

// In-App Notifications
export async function syncNotificationToCloud(notification: AppNotification): Promise<boolean> {
  try {
    const notifRef = doc(db, 'notifications', notification.id);
    await setDoc(notifRef, notification, { merge: true });
    return true;
  } catch (error) {
    console.warn('Syncing notification to cloud warning:', error);
    return false;
  }
}

export function subscribeToUserNotifications(
  userOrId: UserProfile | string | null | undefined,
  onUpdate: (notifications: AppNotification[]) => void
): () => void {
  const idsToMatch: string[] = [];
  if (typeof userOrId === 'string' && userOrId) {
    idsToMatch.push(userOrId.toLowerCase());
  } else if (userOrId && typeof userOrId === 'object') {
    if (userOrId.id) idsToMatch.push(String(userOrId.id).toLowerCase());
    if (userOrId.userId) idsToMatch.push(String(userOrId.userId).toLowerCase());
    if (userOrId.email) idsToMatch.push(String(userOrId.email).toLowerCase());
  }

  const q = query(collection(db, 'notifications'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((d) => {
        const notif = d.data() as AppNotification;
        if (!idsToMatch.length) return;
        const targetUserId = notif.userId ? String(notif.userId).toLowerCase() : '';
        if (idsToMatch.includes(targetUserId)) {
          list.push(notif);
        }
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime notifications subscription warning:', err);
    }
  );
}

export async function markNotificationAsReadInCloud(notificationId: string): Promise<boolean> {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    return true;
  } catch (error) {
    console.warn('Marking notification read warning:', error);
    return false;
  }
}

export async function markAllNotificationsAsReadInCloud(userId: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'notifications'));
    const snapshot = await getDocs(q);
    const updates: Promise<any>[] = [];
    snapshot.forEach((d) => {
      const notif = d.data() as AppNotification;
      if (notif.userId === userId && !notif.read) {
        updates.push(updateDoc(doc(db, 'notifications', d.id), { read: true }));
      }
    });
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.warn('Marking all notifications read warning:', error);
    return false;
  }
}

export async function deleteNotificationFromCloud(notificationId: string): Promise<boolean> {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notifRef);
    return true;
  } catch (error) {
    console.warn('Deleting notification warning:', error);
    return false;
  }
}

