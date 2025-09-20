import { GroupList, ChatArea } from "@/components";

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
    timestamp: "10:30 AM",
    isSent: false,
    senderName: "John Doe",
  },
  {
    id: "2",
    content: "Great! Working on the new project",
    timestamp: "10:32 AM",
    isSent: true,
  },
  {
    id: "3",
    content: "Same here, just finished the design mockups",
    timestamp: "10:35 AM",
    isSent: false,
    senderName: "Jane Smith",
  },
  {
    id: "4",
    content: "Awesome! Can't wait to see them",
    timestamp: "10:36 AM",
    isSent: true,
  },
];

export default function Home() {
  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <GroupList groups={mockGroups} activeGroupId="1" />
      </div>
      <div className="flex-1">
        <ChatArea groupName="General Discussion" messages={mockMessages} />
      </div>
    </div>
  );
}
