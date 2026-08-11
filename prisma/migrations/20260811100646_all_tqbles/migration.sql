-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "nic" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_properties" (
    "id" SERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "property_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ticket_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "category_label" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "property_id" INTEGER NOT NULL,
    "assigned_to_id" TEXT,
    "sla_target" TEXT NOT NULL,
    "complaint_source" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ccto_list" JSONB NOT NULL DEFAULT '[]',
    "send_email" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_remarks" (
    "id" SERIAL NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "remark_type" TEXT NOT NULL,
    "status_changed_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "ticket_remarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sla_notifications" (
    "id" SERIAL NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "warning_80_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_sla_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_schedulers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "day" INTEGER,
    "time" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_schedulers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_nic_idx" ON "customers"("nic");

-- CreateIndex
CREATE INDEX "customer_properties_customer_id_idx" ON "customer_properties"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_properties_customer_id_property_name_key" ON "customer_properties"("customer_id", "property_name");

-- CreateIndex
CREATE INDEX "tickets_customer_id_idx" ON "tickets"("customer_id");

-- CreateIndex
CREATE INDEX "tickets_property_id_idx" ON "tickets"("property_id");

-- CreateIndex
CREATE INDEX "tickets_assigned_to_id_idx" ON "tickets"("assigned_to_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_category_idx" ON "tickets"("category");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "tickets_created_at_idx" ON "tickets"("created_at");

-- CreateIndex
CREATE INDEX "ticket_remarks_ticket_id_idx" ON "ticket_remarks"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_remarks_updated_by_idx" ON "ticket_remarks"("updated_by");

-- CreateIndex
CREATE INDEX "ticket_remarks_created_at_idx" ON "ticket_remarks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_sla_notifications_ticket_id_key" ON "ticket_sla_notifications"("ticket_id");

-- CreateIndex
CREATE INDEX "report_schedulers_active_idx" ON "report_schedulers"("active");

-- CreateIndex
CREATE INDEX "report_schedulers_frequency_idx" ON "report_schedulers"("frequency");

-- AddForeignKey
ALTER TABLE "customer_properties" ADD CONSTRAINT "customer_properties_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "customer_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_remarks" ADD CONSTRAINT "ticket_remarks_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_remarks" ADD CONSTRAINT "ticket_remarks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sla_notifications" ADD CONSTRAINT "ticket_sla_notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
