/*
  Warnings:

  - You are about to drop the column `avatar_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_avatar_id_fkey`;

-- DropIndex
DROP INDEX `User_avatar_id_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `avatar_id`,
    ADD COLUMN `avatar` VARCHAR(191) NULL;
