import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from './context/AuthContext';

// fixed
interface ProtectedRouteProps {
  children?: React.ReactElement; 
  redirectIfAuth?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectIfAuth }) => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setRedirectTo(''); 
    } else if (redirectIfAuth && user) {
      setRedirectTo(redirectIfAuth); 
    } else {
      setRedirectTo(null); 
    }
  }, [user, isLoading, redirectIfAuth]);

  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;