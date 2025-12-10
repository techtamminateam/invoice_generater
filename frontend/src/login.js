import React, { useState } from 'react';
import { Mail, Lock, Check, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); // 'login' or 'create'

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Account creation states
  const [accountData, setAccountData] = useState({
    email: '',
    verification_code: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =====================================
  // VALIDATION
  // =====================================
  const validateLogin = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAccountCreation = () => {
    const newErrors = {};

    if (!accountData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(accountData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!accountData.verification_code.trim()) {
      newErrors.verification_code = 'Verification code is required';
    }

    if (!accountData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (accountData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (accountData.password !== accountData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================
  // LOGIN
  // =====================================
  const handleLogin = async () => {
    if (!validateLogin()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid email or password');
      }

      // Store user data
      localStorage.setItem("id", result.id);
      localStorage.setItem("role", result.role);
      localStorage.setItem("email", result.email);
      localStorage.setItem("name", result.name);
      localStorage.setItem("employee_id", result.employee_id);
      localStorage.setItem("designation", result.designation);
      localStorage.setItem("loggedInUser", JSON.stringify(result));

      onLoginSuccess(result);

    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // SEND VERIFICATION CODE
  // =====================================
  const handleSendCode = async () => {
    if (!accountData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(accountData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsSendingCode(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountData.email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setIsCodeSent(true);
      setErrors({ success: '✓ Verification code sent to your email!' });
    } catch (error) {
      setErrors({ email: error.message });
    } finally {
      setIsSendingCode(false);
    }
  };

  //======================================
  // SEND RESET VERIFICATION CODE
  //======================================
  const handleResetSendCode = async () => {
    if (!accountData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(accountData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsSendingCode(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/verification-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountData.email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setIsCodeSent(true);
      setErrors({ success: '✓ Verification code sent to your email!' });
    } catch (error) {
      setErrors({ email: error.message });
    } finally {
      setIsSendingCode(false);
    }
  };

  
  // =====================================
  // CREATE ACCOUNT (SETUP PASSWORD)
  // =====================================
  const handleCreateAccount = async () => {
    if (!validateAccountCreation()) return;

    if (!isCodeSent) {
      setErrors({ general: 'Please verify your email first' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          verification_code: accountData.verification_code,
          password: accountData.password
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to setup account');
      }

      // Show success message
      setErrors({ success: '✓ Account created successfully! Redirecting to login...' });
      
      // Reset form and switch to login after 2 seconds
      setTimeout(() => {
        setAccountData({
          email: '',
          verification_code: '',
          password: '',
          confirmPassword: ''
        });
        setIsCodeSent(false);
        setErrors({});
        setView('login');
      }, 2000);

    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };


  // =====================================
  // RESET PASSWORD)
  // =====================================
  const handleResetPassword = async () => {
    if (!validateAccountCreation()) return;

    if (!isCodeSent) {
      setErrors({ general: 'Please verify your email first' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          verification_code: accountData.verification_code,
          password: accountData.password
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to setup account');
      }

      // Show success message
      setErrors({ success: '✓ Password reseted successfully! Redirecting to login...' });
      
      // Reset form and switch to login after 2 seconds
      setTimeout(() => {
        setAccountData({
          email: '',
          verification_code: '',
          password: '',
          confirmPassword: ''
        });
        setIsCodeSent(false);
        setErrors({});
        setView('login');
      }, 2000);

    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };


  const isLoginDisabled = !email || !password || isLoading;
  const isCreateDisabled = !accountData.email || !accountData.verification_code || !accountData.password || !accountData.confirmPassword || isLoading;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Tech Tammina</h1>
          <p className="text-xl text-blue-100">Manage your workforce efficiently</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* General Error/Success Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {errors.success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-green-700 text-sm">{errors.success}</p>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className='flex justify-center pb-5'>
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC83vvQLlJ68OzouX132qyPqWSaiSyZ5nSZg&s" alt="Tech Tammina Logo" className="logo" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Log into your account</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                      }}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({});
                      }}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end">
                  <span 
                      onClick={() => {
                        setView('forgot');
                        setErrors({});
                        setEmail('');
                        setPassword('');
                      }}
                      className="text-blue-600 cursor-pointer hover:text-blue-700"
                    >
                      Forgot Password?
                    </span>
                </div>

                <button 
                  onClick={handleLogin}
                  disabled={isLoginDisabled}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Login'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    New user?{' '}
                    <span 
                      onClick={() => {
                        setView('create');
                        setErrors({});
                        setEmail('');
                        setPassword('');
                      }}
                      className="text-blue-600 font-medium cursor-pointer hover:text-blue-700"
                    >
                      Create Account
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CREATE ACCOUNT VIEW */}
          {view === 'create' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Account</h2>
              <p className="text-sm text-gray-600 mb-6">Setup your password to access your account</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={accountData.email}
                    onChange={(e) => {
                      setAccountData({ ...accountData, email: e.target.value });
                      setErrors({});
                    }}
                    disabled={isCodeSent}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={accountData.verification_code}
                      onChange={(e) => {
                        setAccountData({ ...accountData, verification_code: e.target.value });
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={isSendingCode || isCodeSent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-green-500 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                    >
                      {isSendingCode ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isCodeSent ? (
                        <><Check className="w-4 h-4" /> Sent</>
                      ) : (
                        'Send Code'
                      )}
                    </button>
                  </div>
                  {errors.verification_code && <p className="text-red-500 text-sm mt-1">{errors.verification_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={accountData.password}
                    onChange={(e) => {
                      setAccountData({ ...accountData, password: e.target.value });
                      setErrors({});
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={accountData.confirmPassword}
                    onChange={(e) => {
                      setAccountData({ ...accountData, confirmPassword: e.target.value });
                      setErrors({});
                    }}
                    onKeyPress={(e) => handleKeyPress(e, handleCreateAccount)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handleCreateAccount}
                  disabled={isCreateDisabled}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <span 
                      onClick={() => {
                        setView('login');
                        setErrors({});
                        setIsCodeSent(false);
                        setAccountData({
                          email: '',
                          verification_code: '',
                          password: '',
                          confirmPassword: ''
                        });
                      }}
                      className="text-blue-600 font-medium cursor-pointer hover:text-blue-700"
                    >
                      Login
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          {view === 'forgot' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
              <p className="text-sm text-gray-600 mb-6">Reset your password with your registered email</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={accountData.email}
                    onChange={(e) => {
                      setAccountData({ ...accountData, email: e.target.value });
                      setErrors({});
                    }}
                    disabled={isCodeSent}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={accountData.verification_code}
                      onChange={(e) => {
                        setAccountData({ ...accountData, verification_code: e.target.value });
                        setErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleResetSendCode}
                      disabled={isSendingCode || isCodeSent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-green-500 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                    >
                      {isSendingCode ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isCodeSent ? (
                        <><Check className="w-4 h-4" /> Sent</>
                      ) : (
                        'Send Code'
                      )}
                    </button>
                  </div>
                  {errors.verification_code && <p className="text-red-500 text-sm mt-1">{errors.verification_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={accountData.password}
                    onChange={(e) => {
                      setAccountData({ ...accountData, password: e.target.value });
                      setErrors({});
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={accountData.confirmPassword}
                    onChange={(e) => {
                      setAccountData({ ...accountData, confirmPassword: e.target.value });
                      setErrors({});
                    }}
                    onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={isCreateDisabled}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <span 
                      onClick={() => {
                        setView('login');
                        setErrors({});
                        setIsCodeSent(false);
                        setAccountData({
                          email: '',
                          verification_code: '',
                          password: '',
                          confirmPassword: ''
                        });
                      }}
                      className="text-blue-600 font-medium cursor-pointer hover:text-blue-700"
                    >
                      Login
                    </span>
                  </p>
                </div>
              </div>
            </div> 
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;