import React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "../atoms/Avatar";
import { Heading } from "../atoms/Heading";
import { Button } from "../atoms/Button";
import { BackArrowIcon, LogoutIcon } from "../atoms/Icons";

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
            <BackArrowIcon className="flex-shrink-0" />
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
            <LogoutIcon />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
