-- CreateTable
CREATE TABLE "login_audit_logs" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "identifier" VARCHAR(255),
    "event" VARCHAR(20) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_audit_logs_employee_id_idx" ON "login_audit_logs"("employee_id");

-- CreateIndex
CREATE INDEX "login_audit_logs_created_at_idx" ON "login_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "login_audit_logs_event_idx" ON "login_audit_logs"("event");

-- CreateIndex
CREATE INDEX "login_audit_logs_success_idx" ON "login_audit_logs"("success");

-- AddForeignKey
ALTER TABLE "login_audit_logs" ADD CONSTRAINT "login_audit_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
