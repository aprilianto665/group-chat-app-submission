/**
 * User Registration Page Component
 *
 * Provides the user registration interface with:
 * - Registration form with validation
 * - Responsive layout with illustration
 * - Authentication flow integration
 * - Error handling and user feedback
 */

import { PageHeader, RegisterForm, AuthIllustration } from "@/components";

/**
 * Registration Page Component
 *
 * Renders the user registration page with form and illustration.
 * Uses responsive design to show illustration on larger screens.
 *
 * @returns JSX element containing the registration form and layout
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <PageHeader
            title="Create your Binder account"
            subtitle="Join your community and start connecting"
            className="mb-8"
          />

          <RegisterForm />
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-8 bg-white">
        <AuthIllustration alt="Register illustration showing data analysis dashboard" />
      </div>
    </div>
  );
}
