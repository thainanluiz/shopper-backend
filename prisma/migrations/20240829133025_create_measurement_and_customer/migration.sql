-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('WATER', 'GAS');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "measurement_datetime" TIMESTAMP(3) NOT NULL,
    "measurement_type" "MeasurementType" NOT NULL,
    "measurement_value" DOUBLE PRECISION NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "image_link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_measurement_date" ON "Measurement"("measurement_datetime");

-- CreateIndex
CREATE INDEX "index_measurement_type" ON "Measurement"("measurement_type");

-- CreateIndex
CREATE INDEX "index_measurement_customer" ON "Measurement"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_customer_id_measurement_type_measurement_dateti_key" ON "Measurement"("customer_id", "measurement_type", "measurement_datetime");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
