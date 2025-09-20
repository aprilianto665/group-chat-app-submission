import Image from "next/image";

interface NavProps {
  className?: string;
}

export const Nav: React.FC<NavProps> = ({ className = "" }) => {
  return (
    <div
      className={`
        bg-white border-gray-200
        w-full h-16 flex items-center justify-start px-4 border-b
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
    </div>
  );
};
