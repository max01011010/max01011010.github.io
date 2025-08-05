import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Login: React.FC = () => {
  // This state directly controls the 'view' prop of the Auth component.
  // It can be 'sign_in', 'sign_up', 'magic_link', 'forgotten_password', or 'update_password'.
  const [currentAuthView, setCurrentAuthView] = useState<'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password' | 'update_password'>('sign_in');

  // Function to handle top button clicks
  const handleAuthMethodChange = (method: 'password' | 'magic_link') => {
    if (method === 'magic_link') {
      setCurrentAuthView('magic_link');
    } else {
      setCurrentAuthView('sign_in'); // Default to sign_in when password method is chosen
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in or create an account to manage your habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={currentAuthView === 'magic_link' ? 'default' : 'outline'}
              onClick={() => handleAuthMethodChange('magic_link')}
              className="w-1/2"
            >
              Magic Link
            </Button>
            <Button
              variant={['sign_in', 'forgotten_password', 'update_password'].includes(currentAuthView) ? 'default' : 'outline'}
              onClick={() => handleAuthMethodChange('password')}
              className="w-1/2"
            >
              Password
            </Button>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
            redirectTo={window.location.origin}
            magicLink={false} // Explicitly disable magicLink prop to rely solely on 'view'
            view={currentAuthView} // Explicitly control the view
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Your password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign In',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: '', // Hide default link
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a password',
                  button_label: 'Sign Up',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: '', // Hide default link
                },
                forgotten_password: {
                  email_label: 'Email address',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset password instructions',
                  link_text: '', // Hide default link
                  confirmation_text: 'Check your email for the password reset link!',
                },
                update_password: {
                  password_label: 'New password',
                  password_input_placeholder: 'Your new password',
                  button_label: 'Update password',
                  confirmation_text: 'Your password has been updated!',
                },
                magic_link: {
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send Magic Link',
                  link_text: '', // Hide default link
                  confirmation_text: 'Check your email for the magic link!',
                },
              },
            }}
          />

          {/* Custom navigation buttons */}
          {currentAuthView === 'sign_in' && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setCurrentAuthView('forgotten_password')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Forgot your password?
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Don't have an account?{' '}
                <Button variant="link" onClick={() => setCurrentAuthView('sign_up')} className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline">
                  Sign Up
                </Button>
              </p>
            </div>
          )}

          {currentAuthView === 'sign_up' && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Button variant="link" onClick={() => setCurrentAuthView('sign_in')} className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Button>
              </p>
            </div>
          )}

          {currentAuthView === 'forgotten_password' && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setCurrentAuthView('sign_in')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;