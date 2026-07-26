-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');

-- CreateEnum
CREATE TYPE "PortionSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'FULL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('DRAFT', 'ADDED_TO_JOURNAL', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" DECIMAL(8,2) NOT NULL,
    "proteinGrams" DECIMAL(8,2) NOT NULL,
    "carbsGrams" DECIMAL(8,2) NOT NULL,
    "fatGrams" DECIMAL(8,2) NOT NULL,
    "servingLabel" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "foodId" TEXT,
    "imageId" TEXT,
    "predictedLabel" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "confidence" DECIMAL(5,2) NOT NULL,
    "portionSize" "PortionSize" NOT NULL DEFAULT 'MEDIUM',
    "portionLabel" TEXT,
    "calories" DECIMAL(8,2) NOT NULL,
    "proteinGrams" DECIMAL(8,2) NOT NULL,
    "carbsGrams" DECIMAL(8,2) NOT NULL,
    "fatGrams" DECIMAL(8,2) NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'DRAFT',
    "rawPrediction" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "sourceScanId" TEXT,
    "mealType" "MealType" NOT NULL DEFAULT 'OTHER',
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "foodId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL DEFAULT 1,
    "portionSize" "PortionSize" NOT NULL DEFAULT 'MEDIUM',
    "portionLabel" TEXT,
    "calories" DECIMAL(8,2) NOT NULL,
    "proteinGrams" DECIMAL(8,2) NOT NULL,
    "carbsGrams" DECIMAL(8,2) NOT NULL,
    "fatGrams" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSnapshot" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "rangeStart" TIMESTAMP(3) NOT NULL,
    "rangeEnd" TIMESTAMP(3) NOT NULL,
    "totalCalories" DECIMAL(10,2) NOT NULL,
    "totalProteinGrams" DECIMAL(10,2) NOT NULL,
    "totalCarbsGrams" DECIMAL(10,2) NOT NULL,
    "totalFatGrams" DECIMAL(10,2) NOT NULL,
    "mealCount" INTEGER NOT NULL,
    "recommendations" JSONB,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Food_slug_key" ON "Food"("slug");

-- CreateIndex
CREATE INDEX "Food_slug_idx" ON "Food"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Scan_imageId_key" ON "Scan"("imageId");

-- CreateIndex
CREATE INDEX "Scan_createdAt_idx" ON "Scan"("createdAt");

-- CreateIndex
CREATE INDEX "Scan_status_createdAt_idx" ON "Scan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Scan_foodId_idx" ON "Scan"("foodId");

-- CreateIndex
CREATE INDEX "Meal_loggedAt_idx" ON "Meal"("loggedAt");

-- CreateIndex
CREATE INDEX "Meal_mealType_loggedAt_idx" ON "Meal"("mealType", "loggedAt");

-- CreateIndex
CREATE INDEX "Meal_sourceScanId_idx" ON "Meal"("sourceScanId");

-- CreateIndex
CREATE INDEX "MealItem_mealId_idx" ON "MealItem"("mealId");

-- CreateIndex
CREATE INDEX "MealItem_foodId_idx" ON "MealItem"("foodId");

-- CreateIndex
CREATE INDEX "ReportSnapshot_type_rangeStart_rangeEnd_idx" ON "ReportSnapshot"("type", "rangeStart", "rangeEnd");

-- CreateIndex
CREATE INDEX "ReportSnapshot_createdAt_idx" ON "ReportSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ScanImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_sourceScanId_fkey" FOREIGN KEY ("sourceScanId") REFERENCES "Scan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
