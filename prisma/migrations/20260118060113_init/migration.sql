-- AlterTable
ALTER TABLE `User` ADD COLUMN `provider` ENUM('local', 'google', 'github') NOT NULL DEFAULT 'local',
    ADD COLUMN `provider_id` VARCHAR(191) NULL;
