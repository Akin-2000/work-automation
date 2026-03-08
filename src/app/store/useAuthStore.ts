import { create } from 'zustand';
import users from '../../mock-data/users.json';

export type UserRole = 'admin' | 'user';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('user'),
  login: async (email, password) => {
    // Mock login simulation
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        avatar: user.avatar
      };
      set({ user: userData, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
  },
}));
