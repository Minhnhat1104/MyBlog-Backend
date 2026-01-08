/*
  Warnings:

  - A unique constraint covering the columns `[password_reset_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_password_reset_token_key` ON `User`(`password_reset_token`);
