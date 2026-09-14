-- CreateEnum
CREATE TYPE "Module" AS ENUM ('INVENTORY', 'SALES', 'PURCHASING', 'ACCOUNTING');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "enabledModules" "Module"[] DEFAULT ARRAY[]::"Module"[],
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ALTER COLUMN "name" SET DEFAULT '';

