"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SpaceManager, ChatArea } from "@/components";
import { useProfileStore } from "@/stores/profileStore";
import type { Space, Message, User } from "@/types";

const mockMessagesBySpace: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hey everyone! How's it going?",
      timestamp: "2024-01-15T10:30:00",
      isSent: false,
      senderName: "John Doe",
    },
    {
      id: "2",
      content: "Great! Working on the new project",
      timestamp: "2024-01-15T10:32:00",
      isSent: true,
    },
    {
      id: "3",
      content: "Same here, just finished the design mockups",
      timestamp: "2024-01-15T10:35:00",
      isSent: false,
      senderName: "Jane Smith",
    },
  ],
  "2": [
    {
      id: "1",
      content: "Kickoff notes updated in the doc.",
      timestamp: "2024-02-10T09:00:00",
      isSent: false,
      senderName: "PM",
    },
    {
      id: "2",
      content: "The deadline is next week",
      timestamp: "2024-02-11T12:00:00",
      isSent: false,
      senderName: "Lead",
    },
  ],
  "3": [
    {
      id: "1",
      content: "Did you see that movie?",
      timestamp: "2024-03-01T20:00:00",
      isSent: false,
      senderName: "Friend",
    },
    {
      id: "2",
      content: "Not yet, is it good?",
      timestamp: "2024-03-01T20:05:00",
      isSent: true,
    },
  ],
  "4": [
    {
      id: "1",
      content: "New framework released!",
      timestamp: "2024-04-05T08:00:00",
      isSent: false,
      senderName: "Bot",
    },
  ],
};

const mockSpaceMetas: Array<
  Pick<Space, "id" | "name"> & { unreadCount?: number }
> = [
  { id: "1", name: "General Discussion", unreadCount: 3 },
  { id: "2", name: "Project Alpha", unreadCount: 0 },
  { id: "3", name: "Random Chat", unreadCount: 1 },
  { id: "4", name: "Tech Updates", unreadCount: 0 },
];

// Precomputed spaces are no longer used directly; state is initialized below.

export const AppWrapper: React.FC<{ user: User }> = ({ user }) => {
  const { setUser } = useProfileStore();
  const [activeSpaceId, setActiveSpaceId] = useState<string>("1");
  const [messagesBySpace, setMessagesBySpace] = useState<
    Record<string, Message[]>
  >(() => mockMessagesBySpace);
  const [spaces, setSpaces] = useState<Space[]>(() => {
    return mockSpaceMetas.map((meta) => {
      const messages = mockMessagesBySpace[meta.id] ?? [];
      const last = messages[messages.length - 1];
      return {
        id: meta.id,
        name: meta.name,
        unreadCount: meta.unreadCount,
        lastMessage: last?.content,
      };
    });
  });

  useEffect(() => {
    setUser({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? "/avatar_default.jpg",
    });
  }, [user, setUser]);

  const activeSpace = useMemo(
    () => spaces.find((s) => s.id === activeSpaceId) ?? spaces[0],
    [activeSpaceId, spaces]
  );

  const handleSpaceCreated = (spaceName: string) => {
    const newId = String(Date.now());
    setMessagesBySpace((prev) => ({ ...prev, [newId]: [] }));
    setSpaces((prev) => [
      ...prev,
      {
        id: newId,
        name: spaceName,
        unreadCount: 0,
        lastMessage: undefined,
      },
    ]);
    setActiveSpaceId(newId);
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <SpaceManager
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          onSelectSpace={setActiveSpaceId}
          onSpaceCreated={handleSpaceCreated}
        />
      </div>
      <div className="flex-1">
        <ChatArea
          groupName={activeSpace?.name}
          messages={messagesBySpace[activeSpaceId] ?? []}
        />
      </div>
    </div>
  );
};
