import { PageHeader } from "@/components/molecules/PageHeader";
import { LoginForm } from "@/components/organisms/LoginForm";
import { LoginIllustration } from "@/components/organisms/LoginIllustration";

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
        <LoginIllustration />
      </div>
    </div>
  );
}
