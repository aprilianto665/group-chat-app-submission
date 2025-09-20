"use client";

import { GroupManager, ChatArea } from "@/components";

interface Group {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
}

const mockGroups: Group[] = [
  {
    id: "1",
    name: "General Discussion",
    lastMessage: "Hey everyone! How's it going?",
    unreadCount: 3,
  },
  {
    id: "2",
    name: "Project Alpha",
    lastMessage: "The deadline is next week",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Random Chat",
    lastMessage: "Did you see that movie?",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Tech Updates",
    lastMessage: "New framework released!",
    unreadCount: 0,
  },
];

const mockMessages: Message[] = [
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
  {
    id: "4",
    content: "Awesome! Can't wait to see them",
    timestamp: "2024-01-15T10:36:00",
    isSent: true,
  },
  {
    id: "5",
    content: "Let's schedule a meeting for tomorrow",
    timestamp: "2024-01-16T09:15:00",
    isSent: false,
    senderName: "Mike Johnson",
  },
  {
    id: "6",
    content: "Sounds good! What time works for everyone?",
    timestamp: "2024-01-16T09:20:00",
    isSent: true,
  },
  {
    id: "7",
    content: "How about 2 PM?",
    timestamp: "2024-01-16T14:00:00",
    isSent: false,
    senderName: "Sarah Wilson",
  },
];

export default function Home() {
  const handleGroupCreated = (groupName: string) => {
    console.log("New group created:", groupName);
    // TODO: Add the new group to the groups list
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <GroupManager
          groups={mockGroups}
          activeGroupId="1"
          onGroupCreated={handleGroupCreated}
        />
      </div>
      <div className="flex-1">
        <ChatArea groupName="General Discussion" messages={mockMessages} />
      </div>
    </div>
  );
}
