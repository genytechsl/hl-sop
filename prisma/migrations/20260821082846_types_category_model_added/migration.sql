-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sla" TEXT NOT NULL,
    "priority" TEXT NOT NULL,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_code_key" ON "ticket_categories"("code");

-- CreateIndex
CREATE INDEX "ticket_categories_label_idx" ON "ticket_categories"("label");
