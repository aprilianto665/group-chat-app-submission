/**
 * User Login Page Component
 *
 * Provides the user login interface with:
 * - Login form with validation
 * - Responsive layout with illustration
 * - Authentication flow integration
 * - Error handling and user feedback
 */

import { PageHeader, LoginForm, AuthIllustration } from "@/components";

/**
 * Login Page Component
 *
 * Renders the user login page with form and illustration.
 * Uses responsive design to show illustration on larger screens.
 *
 * @returns JSX element containing the login form and layout
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <PageHeader
            title="Sign in to Binder"
            subtitle="Connect with your community smarter"
            className="mb-8"
          />

          <LoginForm />
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-8 bg-white">
        <AuthIllustration alt="Login illustration showing data analysis dashboard" />
      </div>
    </div>
  );
}
