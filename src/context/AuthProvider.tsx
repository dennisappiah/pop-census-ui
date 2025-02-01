import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import { censusApi } from '@/services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authenticatedUser = await censusApi.getCurrentUser();
        setUser(authenticatedUser);
      } catch (error) {
        console.error('Failed to fetch user', error);
        navigate(''); // Ensure `navigate` is a function
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const logout = async () => {
    try {
      await censusApi.logout();
      setUser(null);
      navigate(''); // Ensure `navigate` is a function
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
      navigate(''); // Ensure `navigate` is a function
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;