'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft, Sparkles, Clock, Send, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Send verification code
  const sendVerificationCode = async () => {
    if (!formData.username.trim()) {
      setError(t('pleaseEnterUsername') || '请先输入用户名');
      return;
    }

    if (!formData.email.trim()) {
      setError(t('pleaseEnterEmail') || '请先输入邮箱');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmailFormat') || '邮箱格式不正确');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      const result = await api.auth.sendVerificationCode({
        email: formData.email.trim(),
        username: formData.username.trim()
      });

      setSuccess(t('verificationCodeSent') || '验证码已发送到您的邮箱');
      setCodeSent(true);
      setCountdown(300); // 5 minutes countdown
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      
      if (error.message.includes('EMAIL_EXISTS')) {
        setError(t('emailAlreadyRegistered') || '邮箱已被注册');
      } else if (error.message.includes('USERNAME_EXISTS')) {
        setError(t('usernameAlreadyTaken') || '用户名已被占用');
      } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        setError(t('tooManyRequests') || '请求过于频繁，请稍后再试');
      } else {
        setError(error.message || t('failedToSendCode') || '发送验证码失败');
      }
    } finally {
      setSendingCode(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch') || '两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordTooShort') || '密码至少需要6个字符');
      setLoading(false);
      return;
    }

    if (!formData.verificationCode.trim()) {
      setError(t('pleaseEnterVerificationCode') || '请输入邮箱验证码');
      setLoading(false);
      return;
    }

    try {
      // First verify the code
      await api.auth.verifyCode({
        email: formData.email.trim(),
        code: formData.verificationCode.trim()
      });

      // Then register the user
      const result = await api.auth.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.user) {
        login(result.user, result.access_token);
        router.push('/');
      } else {
        setError(t('registrationFailed') || '注册失败');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.message.includes('INVALID_CODE')) {
        setError(t('invalidVerificationCode') || '验证码不正确');
      } else if (error.message.includes('CODE_EXPIRED')) {
        setError(t('codeExpired') || '验证码已过期，请重新获取');
        setCodeSent(false);
        setCountdown(0);
      } else if (error.message.includes('TOO_MANY_ATTEMPTS')) {
        setError(t('tooManyAttempts') || '验证尝试次数过多，请重新获取验证码');
        setCodeSent(false);
        setCountdown(0);
      } else {
        setError(error.message || t('registrationFailed') || '注册失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Link>

        {/* Registration form */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {t('createAccount')}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('appName')}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Username input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('enterUsername')}
                  required
                />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
            </div>

            {/* Email verification */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('emailVerificationCode')}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder={t('enterVerificationCode')}
                    maxLength={6}
                    required
                  />
                  {codeSent && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || countdown > 0}
                  className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {sendingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      {formatTime(countdown)}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('sendCode')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('enterPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm password input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('enterConfirmPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('registering')}
                </div>
              ) : (
                t('register')
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('loginExistingAccount')}{' '}
              <Link 
                href="/login" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
