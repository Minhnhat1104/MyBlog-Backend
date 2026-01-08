-- AlterTable
ALTER TABLE `User` ADD COLUMN `password_reset_expired` DATETIME(3) NULL,
    ADD COLUMN `password_reset_token` VARCHAR(191) NULL;
