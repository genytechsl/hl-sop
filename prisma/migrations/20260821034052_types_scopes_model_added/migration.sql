-- CreateTable
CREATE TABLE "ticket_type_scopes" (
    "id" SERIAL NOT NULL,
    "ticket_type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "ticket_type_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_type_scopes_ticket_type_idx" ON "ticket_type_scopes"("ticket_type");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_type_scopes_ticket_type_scope_key" ON "ticket_type_scopes"("ticket_type", "scope");
