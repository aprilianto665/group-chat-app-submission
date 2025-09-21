import React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "../atoms/Avatar";
import { Heading } from "../atoms/Heading";
import { Button } from "../atoms/Button";

interface ProfileDetailProps {
  avatar?: string;
  name: string;
  username: string;
  onBack?: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({
  avatar,
  name,
  username,
  onBack,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
  };
  return (
    <div className="p-4">
      <div className="mb-4">
        {onBack && (
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 !p-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Space List
          </Button>
        )}
      </div>

      <div>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <Avatar src={avatar} size="lg" className="w-24 h-24">
              {!avatar && name.charAt(0).toUpperCase()}
            </Avatar>
          </div>

          <div className="space-y-2">
            <Heading level={3} className="text-gray-900">
              {name}
            </Heading>
            <p className="text-gray-500 text-lg">@{username}</p>
          </div>
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="w-full rounded-full bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 border-red-500 flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
