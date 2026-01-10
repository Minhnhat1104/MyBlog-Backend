/*
  Warnings:

  - The `edit_at` column on the `Image` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `Image` DROP COLUMN `edit_at`,
    ADD COLUMN `edit_at` DATETIME(3) NULL;
