import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface StoredOrder {
  orderId: string;
  orderNumber: number;
  date: string;
}

interface OrderHistoryContextValue {
  orders: StoredOrder[];
  addOrder: (orderId: string, orderNumber: number) => void;
  removeOrder: (orderId: string) => void;
}

const OrderHistoryContext = createContext<OrderHistoryContextValue | undefined>(undefined);

const STORAGE_KEY = 'cimmple_orders';

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<StoredOrder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((orderId: string, orderNumber: number) => {
    setOrders((prev) => {
      if (prev.some((o) => o.orderId === orderId)) return prev;
      return [{ orderId, orderNumber, date: new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  }, []);

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder, removeOrder }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error('useOrderHistory must be used within OrderHistoryProvider');
  return ctx;
}
