import { createBrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import App from './app';
import ProtectedRoute from './protectedRoutes';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';


const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      { 
        path: "", 
        element: <HomePage /> 
      },
      { 
        path: "dashboard", 
        element: (
          <ProtectedRoute> 
            <Dashboard />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

export default router;