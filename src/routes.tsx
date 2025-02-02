import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AuthPages from './pages/HomePage';
import ProtectedRoute from './protectedRoutes';


const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPages />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);


export default router;