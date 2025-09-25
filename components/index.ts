/**
 * Components Index - Central Export Hub
 *
 * This file serves as the central export hub for all components in the application.
 * It organizes components by their atomic design hierarchy:
 * - Atoms: Basic building blocks (buttons, inputs, icons, etc.)
 * - Molecules: Simple combinations of atoms (forms, headers, etc.)
 * - Organisms: Complex UI components (navigation, chat areas, etc.)
 *
 * This organization follows Atomic Design principles for maintainable and scalable UI architecture.
 */

// ===== ATOMS =====
export { Input } from "./atoms/Input";
export { Button } from "./atoms/Button";
export { Checkbox } from "./atoms/Checkbox";
export { Heading } from "./atoms/Heading";
export { Avatar } from "./atoms/Avatar";
export { ProgressBar } from "./atoms/ProgressBar";
export { AutoResizeTextarea } from "./atoms/AutoResizeTextarea";
export { FormLabel } from "./atoms/FormLabel";
export { ErrorMessage } from "./atoms/ErrorMessage";
export { LoadingSpinner } from "./atoms/LoadingSpinner";
export { EmptyState } from "./atoms/EmptyState";
export { Tooltip } from "./atoms/Tooltip";
export * from "./atoms/Icons";

export { AuthIllustration } from "./atoms/auth/AuthIllustration";
export { MessageBubble } from "./atoms/chat/MessageBubble";

// ===== MOLECULES =====
export { FormField } from "./molecules/FormField";
export { PageHeader } from "./molecules/PageHeader";
export { SearchInput } from "./molecules/SearchInput";

export { SpaceItem } from "./molecules/space/SpaceItem";
export { SpaceListHeader } from "./molecules/space/SpaceListHeader";
export { SpaceList } from "./molecules/space/SpaceList";
export { SpaceForm } from "./molecules/space/SpaceForm";
export { ProfileDetail } from "./molecules/profile/ProfileDetail";
export { ChatHeader } from "./molecules/chat/ChatHeader";
export { ChatInput } from "./molecules/chat/ChatInput";
export { MessageItem } from "./molecules/chat/MessageItem";
export { NoteList } from "./molecules/note/NoteList";
export { NoteEditor } from "./molecules/note/NoteEditor";
export { NoteHeader } from "./molecules/note/NoteHeader";
export { NoteBlockRow } from "./molecules/note/NoteBlockRow";
export { TextBlock } from "./molecules/note/TextBlock";
export { TodoItem } from "./molecules/note/TodoItem";
export { TodoBlock } from "./molecules/note/TodoBlock";
export { BlockMenu } from "./molecules/note/BlockMenu";
export { AddBlockMenu } from "./molecules/note/AddBlockMenu";
export { SaveButton } from "./molecules/note/SaveButton";

// ===== ORGANISMS =====
export { Nav } from "./organisms/Nav";
export { AppWrapper } from "./organisms/AppWrapper";

export { LoginForm } from "./organisms/auth/LoginForm";
export { RegisterForm } from "./organisms/auth/RegisterForm";
export { SpaceManager } from "./organisms/space/SpaceManager";
export { SpaceInfoPanel } from "./organisms/space/SpaceInfoPanel";
export { ChatArea } from "./organisms/chat/ChatArea";
export { MessageList } from "./organisms/chat/MessageList";
export { NotesPanel } from "./organisms/note/NotesPanel";
