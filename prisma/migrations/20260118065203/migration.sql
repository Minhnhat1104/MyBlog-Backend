/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_provider_id_key` ON `User`(`provider_id`);
