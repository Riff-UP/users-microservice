-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "biography" SET DEFAULT 'Sin biografía',
ALTER COLUMN "role" SET DEFAULT 'USER';
