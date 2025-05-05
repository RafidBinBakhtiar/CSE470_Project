'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  birthdate?: string;
  bio?: string;
  profileImage?: string;
  points?: number;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token and user data on initial load
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      
      if (storedToken && storedUser) {
        // Check if token is expired
        if (tokenExpiration) {
          const expirationDate = new Date(tokenExpiration);
          if (expirationDate < new Date()) {
            // Token is expired, clear storage and return
            logout();
            setIsLoading(false);
            return;
          }
        }
        
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data with expiration if rememberMe is true
      if (rememberMe) {
        // Set token to expire in 30 days
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        localStorage.setItem('tokenExpiration', expirationDate.toISOString());
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Set token to expire when browser session ends
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      router.push('/');
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw the error to be handled by the signup page
    }
  };

  const logout = () => {
    // Clear token, user data, and expiration from both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('cart'); // Clear cart from localStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login page
    router.push('/login');
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Update storage
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update user data in both storage types
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Fetch latest user data from database
      await fetchUserData();
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token,
      login, 
      signup, 
      logout, 
      isAuthenticated,
      isLoading,
      updateUser,
      fetchUserData
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 