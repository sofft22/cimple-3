import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { OrderHistoryProvider } from '@/context/OrderHistoryContext';
import { useRouter } from '@/lib/router';
import { useAdminAuth, AdminAuthProvider } from '@/hooks/useAdminAuth';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { MyOrdersPage } from '@/pages/MyOrdersPage';
import { DealsPage } from '@/pages/DealsPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminOrdersList } from '@/pages/admin/AdminOrdersList';
import { AdminOrderDetail } from '@/pages/admin/AdminOrderDetail';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { LogOut } from 'lucide-react';

function AdminRoute({ path, navigate }: { path: string; navigate: (p: string) => void }) {
  const { isAuthed } = useAdminAuth();

  if (!isAuthed) {
    return <AdminLogin onNavigate={navigate} />;
  }

  if (path === '/admin' || path === '/admin/') {
    return <AdminDashboard onNavigate={navigate} />;
  }

  if (path === '/admin/orders' || path === '/admin/orders/') {
    return <AdminOrdersList onNavigate={navigate} />;
  }

  const orderMatch = path.match(/^\/admin\/orders\/(.+)$/);
  if (orderMatch) {
    return <AdminOrderDetail orderId={orderMatch[1]} onNavigate={navigate} />;
  }

  if (path === '/admin/products' || path === '/admin/products/') {
    return <AdminProducts onNavigate={navigate} />;
  }

  if (path === '/admin/categories' || path === '/admin/categories/') {
    return <AdminCategories onNavigate={navigate} />;
  }

  return <AdminDashboard onNavigate={navigate} />;
}

function AppContent() {
  const { path, navigate } = useRouter();
  const isAdmin = path.startsWith('/admin');
  const { isAuthed, logout } = useAdminAuth();

  const productMatch = path.match(/^\/product\/(.+)$/);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header onNavigate={navigate} currentPath={path} />

      {isAdmin && isAuthed && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 flex justify-end">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="inline-flex items-center gap-1 text-xs text-[#aaa] hover:text-[#333]"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      )}

      <main className="flex-1">
        {isAdmin ? (
          <AdminRoute path={path} navigate={navigate} />
        ) : path === '/my-orders' || path === '/my-orders/' ? (
          <MyOrdersPage onNavigate={navigate} />
        ) : path === '/deals' || path === '/deals/' ? (
          <DealsPage onNavigate={navigate} />
        ) : path === '/' || path === '' ? (
          <HomePage onNavigate={navigate} />
        ) : productMatch ? (
          <ProductDetailPage productId={productMatch[1]} onNavigate={navigate} />
        ) : (
          <HomePage onNavigate={navigate} />
        )}
      </main>

      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <WishlistProvider>
        <OrderHistoryProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </OrderHistoryProvider>
      </WishlistProvider>
    </AdminAuthProvider>
  );
}
