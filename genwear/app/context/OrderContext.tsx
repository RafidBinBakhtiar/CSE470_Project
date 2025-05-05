import { createContext, useContext, useState, ReactNode } from 'react';
import { useUser } from './UserContext';

interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    size: string;
    color?: string;
    customizations?: {
      color?: string;
      image?: string;
    };
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, updateUser, token, fetchUserData } = useUser();

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token, ...orderData })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setOrders(prev => [...prev, data.order]);

      // Calculate points earned (1 point per 10 taka spent)
      const pointsEarned = Math.floor(orderData.totalAmount / 10);

      // Update user context with new points
      if (user) {
        updateUser({
          ...user,
          points: (user.points || 0) + pointsEarned
        });
      }

      return data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 