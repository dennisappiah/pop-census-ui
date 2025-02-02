import { createContext } from 'react';

type AuthContextType = {
  user: { id: string; name: string } | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
});

export default AuthContext;

