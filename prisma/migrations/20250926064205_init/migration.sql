-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."BlockType" AS ENUM ('TEXT', 'HEADING', 'TODO');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" CITEXT NOT NULL,
    "username" CITEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "password" VARCHAR(72) NOT NULL,
    "avatar" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "icon" VARCHAR(2048),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "spaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."space_members" (
    "spaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("spaceId","userId")
);

-- CreateTable
CREATE TABLE "public"."notes" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "spaceId" UUID NOT NULL,
    "authorId" UUID,
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."note_blocks" (
    "id" BIGSERIAL NOT NULL,
    "noteId" BIGINT NOT NULL,
    "type" "public"."BlockType" NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "todoTitle" VARCHAR(200),
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "note_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."note_todo_items" (
    "id" BIGSERIAL NOT NULL,
    "blockId" BIGINT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "note_todo_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "messages_spaceId_createdAt_idx" ON "public"."messages"("spaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_userId_createdAt_idx" ON "public"."messages"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "space_members_userId_idx" ON "public"."space_members"("userId");

-- CreateIndex
CREATE INDEX "space_members_spaceId_idx" ON "public"."space_members"("spaceId");

-- CreateIndex
CREATE INDEX "notes_spaceId_sortOrder_idx" ON "public"."notes"("spaceId", "sortOrder");

-- CreateIndex
CREATE INDEX "note_blocks_noteId_sortOrder_idx" ON "public"."note_blocks"("noteId", "sortOrder");

-- CreateIndex
CREATE INDEX "note_todo_items_blockId_sortOrder_idx" ON "public"."note_todo_items"("blockId", "sortOrder");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_members" ADD CONSTRAINT "space_members_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_members" ADD CONSTRAINT "space_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_blocks" ADD CONSTRAINT "note_blocks_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_todo_items" ADD CONSTRAINT "note_todo_items_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."note_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
