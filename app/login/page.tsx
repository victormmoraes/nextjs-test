'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Card } from '@/components/ui/molecules/Card';
import { Modal } from '@/components/ui/molecules/Modal';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LOGIN_TIMEOUT = 30000;
const MIN_LOADING_TIME = 800;

function LoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm<LoginFormData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    const startTime = Date.now();

    try {
      const loginPromise = login(data.email, data.password);

      // Add timeout to the login request
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), LOGIN_TIMEOUT);
      });

      await Promise.race([loginPromise, timeoutPromise]);

      // Navigate to return URL or default (with validation to prevent open redirect)
      const returnUrl = searchParams.get('returnUrl');
      const safeReturnUrl =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : '/last-updates';
      router.push(safeReturnUrl);
    } catch (error) {
      // Calculate remaining delay for consistent UX
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, MIN_LOADING_TIME - elapsed);

      await new Promise((resolve) => setTimeout(resolve, remainingDelay));

      // Determine error message
      let errorMsg: string;
      if (error instanceof Error) {
        if (error.message === 'TIMEOUT') {
          errorMsg = t('timeout');
        } else if (error.message.includes('fetch')) {
          errorMsg = t('networkError');
        } else {
          errorMsg = t('error');
        }
      } else {
        errorMsg = t('error');
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailError = () => {
    if (!errors.email) return undefined;
    if (errors.email.type === 'required') return t('emailRequired');
    if (errors.email.type === 'pattern') return t('emailInvalid');
    return undefined;
  };

  const getPasswordError = () => {
    if (!errors.password) return undefined;
    if (errors.password.type === 'required') return t('passwordRequired');
    return undefined;
  };

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Login Card */}
        <Card>
          {/* Logo/Brand Area */}
          <div className="text-center -mx-8 -mt-7 px-6 pt-8 pb-8 mb-6 border-b border-gray-300">
            <div className="flex justify-center">
              <img
                src="/images/regmanager-logo-final.png"
                alt="RegManager Logo"
                className="h-14 w-auto"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              id="email"
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              required
              error={getEmailError()}
              icon={Mail}
              {...register('email', {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                onBlur: () => trigger('email'),
              })}
            />

            <Input
              id="password"
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              required
              error={getPasswordError()}
              icon={Lock}
              {...register('password', {
                required: true,
                onBlur: () => trigger('password'),
              })}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  {...register('rememberMe')}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  {t('rememberMe')}
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-error-50 border border-error-100 rounded p-3">
                <p className="text-sm text-error-600">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              fullWidth
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  {t('signingIn')}
                </span>
              ) : (
                t('signIn')
              )}
            </Button>
          </form>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-sm text-gray-700 cursor-pointer hover:text-primary-800 transition-colors underline"
            >
              {t('needHelp')}
            </button>
          </div>
        </Card>

        {/* Powered By */}
        <div className="mt-8 flex flex-col items-center" />
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <Modal
          title={t('helpModal.title')}
          footer={
            <Button variant="primary" onClick={() => setShowHelpModal(false)}>
              {t('helpModal.close')}
            </Button>
          }
          onClose={() => setShowHelpModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">{t('helpModal.message')}</p>
            <a
              href="mailto:suporte@rioanalytics.com.br"
              className="block text-primary-800 hover:text-primary-600 font-medium transition-colors"
            >
              suporte@rioanalytics.com.br
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}

/**
 * Login Page
 *
 * Features:
 * - Email/password authentication
 * - Form validation with react-hook-form
 * - Loading states with timeout handling
 * - Help modal for support contact
 * - Return URL redirect after login
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
