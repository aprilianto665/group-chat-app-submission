import { AppWrapper } from "@/components";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  listUserSpaces,
  createSpace,
  getSpaceDetail,
  joinSpace,
} from "./actions/spaces";
import {
  sendMessage,
  listMessages,
  sendActivityMessage,
} from "./actions/messages";
import {
  createNote,
  updateNote,
  deleteNote,
  reorderNotes,
} from "./actions/notes";
import type { SpaceWithNotes, Message, Note } from "@/types";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const u = (session?.user || {}) as unknown as {
    id?: string;
    username?: string;
    avatar?: string;
    name?: string | null;
    email?: string | null;
  };
  const user = {
    id: u.id ?? "",
    name: u.name ?? "",
    username: u.username ?? "",
    email: u.email ?? "",
    avatar: u.avatar ?? "/avatar_default.jpg",
  };

  const spaces = (await listUserSpaces()) as SpaceWithNotes[];

  return (
    <AppWrapper
      user={user}
      initialSpaces={spaces}
      actions={{
        createSpace: createSpace as (
          name: string,
          description?: string
        ) => Promise<SpaceWithNotes>,
        getSpaceDetail: getSpaceDetail as (
          spaceId: string
        ) => Promise<SpaceWithNotes>,
        joinSpace,
        leaveSpace: (await import("./actions/spaces")).leaveSpace,
        sendMessage: sendMessage as (
          spaceId: string,
          content: string
        ) => Promise<Message>,
        listMessages: listMessages as (spaceId: string) => Promise<Message[]>,
        sendActivityMessage,
        createNote: createNote as (
          spaceId: string,
          title: string,
          blocks: {
            id?: string;
            type: "text" | "heading" | "todo";
            content: string;
            todoTitle?: string;
            collapsed?: boolean;
            items?: {
              id?: string;
              text: string;
              done?: boolean;
              description?: string;
            }[];
          }[]
        ) => Promise<Note>,
        updateNote: updateNote as (
          noteId: string,
          title: string,
          blocks: {
            id?: string;
            type: "text" | "heading" | "todo";
            content: string;
            todoTitle?: string;
            collapsed?: boolean;
            items?: {
              id?: string;
              text: string;
              done?: boolean;
              description?: string;
            }[];
          }[]
        ) => Promise<Note>,
        deleteNote,
        reorderNotes,
      }}
    />
  );
}
