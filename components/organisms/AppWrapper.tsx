"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SpaceManager, ChatArea } from "@/components";
import { useProfileStore } from "@/stores/profileStore";
import type { Message, User, SpaceWithMessages } from "@/types";

const initialSpaces: SpaceWithMessages[] = [
  {
    id: "1",
    name: "General Discussion",
    unreadCount: 3,
    messages: [
      {
        id: "1",
        content: "Hey everyone! How's it going?",
        timestamp: "2024-01-15T10:30:00",
        senderName: "John Doe",
      },
      {
        id: "2",
        content: "Great! Working on the new project",
        timestamp: "2024-01-15T10:32:00",
        senderName: "ambatucode",
      },
      {
        id: "3",
        content: "Same here, just finished the design mockups",
        timestamp: "2024-01-15T10:35:00",
        senderName: "Jane Smith",
      },
    ],
  },
  {
    id: "2",
    name: "Project Alpha",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "Kickoff notes updated in the doc.",
        timestamp: "2024-02-10T09:00:00",
        senderName: "PM",
      },
      {
        id: "2",
        content: "The deadline is next week",
        timestamp: "2024-02-11T12:00:00",
        senderName: "Lead",
      },
    ],
  },
  {
    id: "3",
    name: "Random Chat",
    unreadCount: 1,
    messages: [
      {
        id: "1",
        content: "Did you see that movie?",
        timestamp: "2024-03-01T20:00:00",
        senderName: "Friend",
      },
      {
        id: "2",
        content: "Not yet, is it good?",
        timestamp: "2024-03-01T20:05:00",
        senderName: "ambatucode",
      },
    ],
  },
  {
    id: "4",
    name: "Tech Updates",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "New framework released!",
        timestamp: "2024-04-05T08:00:00",
        senderName: "Bot",
      },
    ],
  },
];

export const AppWrapper: React.FC<{ user: User }> = ({ user }) => {
  const { setUser } = useProfileStore();
  const [activeSpaceId, setActiveSpaceId] = useState<string>("1");
  const [spaces, setSpaces] = useState<SpaceWithMessages[]>(
    () => initialSpaces
  );

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

  const sortedSpaces = useMemo(() => {
    const copy = [...spaces];
    copy.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp;
      const bLast = b.messages[b.messages.length - 1]?.timestamp;
      const aTs = aLast ? new Date(aLast).getTime() : 0;
      const bTs = bLast ? new Date(bLast).getTime() : 0;
      return bTs - aTs;
    });
    return copy;
  }, [spaces]);

  const handleSpaceCreated = (spaceName: string) => {
    const newId = String(Date.now());
    setSpaces((prev) => [
      ...prev,
      {
        id: newId,
        name: spaceName,
        unreadCount: 0,
        messages: [],
      },
    ]);
    setActiveSpaceId(newId);
  };

  const handleSendMessage = (content: string) => {
    const { user } = useProfileStore.getState();
    const newMessage: Message = {
      id: String(Date.now()),
      content,
      timestamp: new Date().toISOString(),
      senderName: user?.username,
    };
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? {
              ...s,
              messages: [...s.messages, newMessage],
            }
          : s
      )
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <SpaceManager
          spaces={sortedSpaces.map(({ id, name, unreadCount, messages }) => ({
            id,
            name,
            unreadCount,
            lastMessage: messages[messages.length - 1]?.content,
          }))}
          activeSpaceId={activeSpaceId}
          onSelectSpace={setActiveSpaceId}
          onSpaceCreated={handleSpaceCreated}
        />
      </div>
      <div className="flex-1">
        <ChatArea
          groupName={activeSpace?.name}
          messages={activeSpace?.messages ?? []}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
