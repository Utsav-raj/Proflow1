import { createContext, useContext, useState, useCallback } from 'react';
import { users } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = users.find(u => u.email === email);
    if (user && password.length >= 6) {
      setCurrentUser(user);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (users.find(u => u.email === email)) {
      setIsLoading(false);
      return { success: false, error: 'Email already exists' };
    }
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      avatar: null,
      role: 'Member',
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      color: '#6366f1',
    };
    setCurrentUser(newUser);
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
