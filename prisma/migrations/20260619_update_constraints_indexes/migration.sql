-- 修改外键约束为 RESTRICT，避免删除用户/图书时级联抹除借阅记录与审计日志

-- DropForeignKey: borrow_records -> users (原为 CASCADE)
ALTER TABLE "borrow_records" DROP CONSTRAINT "borrow_records_user_id_fkey";

-- DropForeignKey: borrow_records -> books (原为 CASCADE)
ALTER TABLE "borrow_records" DROP CONSTRAINT "borrow_records_book_id_fkey";

-- DropForeignKey: audit_logs -> users (原为 CASCADE)
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- AddForeignKey: borrow_records -> users (改为 RESTRICT)
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: borrow_records -> books (改为 RESTRICT)
ALTER TABLE "borrow_records" ADD CONSTRAINT "borrow_records_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: audit_logs -> users (改为 RESTRICT)
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex: 复合索引 (user_id, book_id, return_date)，用于按用户与图书查询借阅历史
CREATE INDEX "borrow_records_user_id_book_id_return_date_idx" ON "borrow_records"("user_id", "book_id", "return_date");

-- CreateIndex: 复合索引 (status, due_date, return_date)，用于逾期与未归还查询
CREATE INDEX "borrow_records_status_due_date_return_date_idx" ON "borrow_records"("status", "due_date", "return_date");

-- AddCheckConstraint: stock 非负约束，Prisma schema 不直接支持 CHECK，需在数据库层添加
ALTER TABLE "books" ADD CONSTRAINT "books_stock_non_negative" CHECK ("stock" >= 0);
