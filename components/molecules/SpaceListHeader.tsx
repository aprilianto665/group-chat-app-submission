import React from "react";
import { Heading } from "../atoms/Heading";
import { Button } from "../atoms/Button";

interface SpaceListHeaderProps {
  onCreateSpace?: () => void;
  className?: string;
}

export const SpaceListHeader: React.FC<SpaceListHeaderProps> = ({
  onCreateSpace,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Heading level={3} className="text-[#4D46E4]">
        Binder
      </Heading>
      {onCreateSpace && (
        <Button
          variant="icon"
          size="sm"
          onClick={onCreateSpace}
          className="text-[#4F45E4] hover:text-[#4339D1]"
          title="Create a space"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      )}
    </div>
  );
};
