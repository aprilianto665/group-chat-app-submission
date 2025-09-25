"use client";

/**
 * Navigation Component
 *
 * Main navigation component with responsive design:
 * - Logo display with consistent branding
 * - User avatar with profile access
 * - Responsive layout (horizontal on mobile, vertical on desktop)
 * - Profile trigger functionality
 * - Clean, minimal design
 */

import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Props interface for Nav component
 */
interface NavProps {
  className?: string;
}

/**
 * Navigation Component Implementation
 *
 * Renders the main navigation with logo and user avatar.
 * Handles responsive design and profile access.
 *
 * @param className - Additional CSS classes for styling
 */
export const Nav: React.FC<NavProps> = ({ className = "" }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const handleAvatarClick = () => {
    window.dispatchEvent(new CustomEvent("profileTrigger"));
  };

  return (
    <div
      className={`
        bg-white border-gray-200 relative
        w-full h-16 flex items-center justify-between px-4 md:px-2 border-b
        md:w-16 md:h-screen md:flex-col md:items-center md:py-6 md:border-r md:border-b-0
        ${className}
      `}
    >
      <Image
        src="/binder_logo.png"
        alt="Logo"
        width={40}
        height={40}
        className="w-10 h-10 object-contain"
      />

      {isHomePage && (
        <div className="md:absolute md:bottom-6">
          <button
            onClick={handleAvatarClick}
            className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="View Profile"
          >
            <Image
              src="/avatar_default.jpg"
              alt="User Avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>
        </div>
      )}
    </div>
  );
};
