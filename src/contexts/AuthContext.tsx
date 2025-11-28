import React, { createContext, useState, useContext, ReactNode } from 'react';
import { showSuccess } from '@/utils/toast';
import { useAttendance } from './AttendanceContext'; // Import useAttendance

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // We can now use useAttendance because AttendanceProvider is a parent in App.tsx
  const { clearHistory } = useAttendance(); 
  
  // Use localStorage to persist authentication state across refreshes
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const login = (username: string, password: string): boolean => {
    // Simple hardcoded authentication: admin/admin
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      showSuccess('Login successful!');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    clearHistory(); // Clear attendance history on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};