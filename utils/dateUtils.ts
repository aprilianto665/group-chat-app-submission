export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const groupMessagesByDate = <T extends { timestamp: string }>(
  messages: T[]
): { [key: string]: T[] } => {
  const grouped: { [key: string]: T[] } = {};

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();
    if (!grouped[messageDate]) {
      grouped[messageDate] = [];
    }
    grouped[messageDate].push(message);
  });

  return grouped;
};
