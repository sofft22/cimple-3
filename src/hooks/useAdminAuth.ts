import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  createElement,
} from 'react';

const STORAGE_KEY = 'admin_authed';

interface AdminAuthValue {
  isAuthed: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  );

  const login = useCallback((password: string) => {
    if (password === 'admin123') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthed(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthed(false);
  }, []);

  return createElement(
    AdminAuthContext.Provider,
    { value: { isAuthed, login, logout } },
    children
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
