import React, { useState, ChangeEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {  censusApi } from '@/services/api';


const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [registerData, setRegisterData] = useState({
    username: '',
    role: '',
    password: '',
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  // Handle input change for registration form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input change for login form
  const handleLoginInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await censusApi.registerUser({
        username: registerData.username,
        password: registerData.password,
        role: registerData.role,
      });

      toast.success('Account created successfully!');
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await censusApi.loginUser({
        username: loginData.username,
        password: loginData.password,
      });
  
      console.log('API Response:', response); // Log the response
  
      const token = response?.token || ''; 
  
      if (token) { 
        localStorage.setItem('census_token', token);
        console.log('Token saved to localStorage:', token); // Log the token
      } else {
        throw new Error('No token received from server');
      }
  
      toast.success('Login successful!');
      console.log('Navigating to /dashboard'); // Log before navigation
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login Error:', err);
  
      let errorMessage = 'Login failed. Please check your credentials.';
  
      // Handle Axios errors
      if (err.response) {
        errorMessage = err.response.data.message || err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  // Styles for inputs, buttons, and links
  const inputStyles =
    'w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-200 text-gray-700';
  const buttonStyles =
    'w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const linkButtonStyles =
    'text-blue-600 hover:text-blue-800 text-sm font-semibold transition duration-200';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? 'Please enter your credentials to continue'
              : 'Fill in your information to get started'}
          </p>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={handleLoginInputChange}
                required
                className={inputStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  required
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={buttonStyles}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        ) : (
          // Registration Form
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={registerData.username}
                onChange={handleInputChange}
                required
                className={inputStyles}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={registerData.role}
                onChange={handleInputChange}
                required
                className={inputStyles}
              >
                <option value="">Select your role</option>
                <option value="AGENT">Agent</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  required
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={buttonStyles}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Toggle between login and register forms */}
        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className={linkButtonStyles}>
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;