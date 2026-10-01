import { Order, OrderStatus, EscrowStatus } from '../types';

export interface CreateOrderPayload {
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerLocation?: any;
  serviceId: string;
  serviceTitle: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLocation?: any;
  amount: number;
  withRush?: boolean;
  deadline?: string;
}

/**
 * Creates an escrow order via the hardened server endpoint
 */
export async function createOrderViaServer(payload: CreateOrderPayload): Promise<Order | null> {
  try {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create order' }));
      console.warn('Server order creation warning:', err);
      return null;
    }

    const data = await res.json();
    return data.order as Order;
  } catch (err) {
    console.error('Network error creating order via server:', err);
    return null;
  }
}

/**
 * Transitions escrow order status via the hardened server endpoint
 */
export async function updateOrderStatusViaServer(
  orderId: string,
  action: 'deliver' | 'release' | 'dispute' | 'refund' | 'cancel',
  userId?: string
): Promise<{ success: boolean; status?: OrderStatus; escrowStatus?: EscrowStatus }> {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, userId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update order status' }));
      console.warn('Server status transition warning:', err);
      return { success: false };
    }

    const data = await res.json();
    return {
      success: true,
      status: data.status as OrderStatus,
      escrowStatus: data.escrowStatus as EscrowStatus,
    };
  } catch (err) {
    console.error('Network error transitioning order status via server:', err);
    return { success: false };
  }
}
