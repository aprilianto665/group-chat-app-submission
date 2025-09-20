"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavProps {
  className?: string;
}

export const Nav: React.FC<NavProps> = ({ className = "" }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div
      className={`
        bg-white border-gray-200 relative
        w-full h-16 flex items-center justify-between px-4 border-b
        md:w-16 md:h-screen md:flex-col md:items-center md:py-6 md:border-r md:border-b-0
        ${className}
      `}
    >
      <Image
        src="/binder_logo.png"
        alt="Logo"
        width={48}
        height={48}
        className="w-10 h-10 md:w-12 md:h-12 md:mb-8 object-contain"
      />

      {isHomePage && (
        <div className="md:absolute md:bottom-6">
          <Image
            src="/avatar_default.jpg"
            alt="User Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
