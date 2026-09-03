-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "other_emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "other_mobiles" TEXT[] DEFAULT ARRAY[]::TEXT[];
