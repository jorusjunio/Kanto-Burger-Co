ALTER TABLE "Order" ADD COLUMN "trackingToken" TEXT;

UPDATE "Order"
SET "trackingToken" = concat('legacy-', "id")
WHERE "trackingToken" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "trackingToken" SET NOT NULL;

CREATE UNIQUE INDEX "Order_trackingToken_key" ON "Order"("trackingToken");
