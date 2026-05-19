CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "BorrowStatus" AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE');

CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "books" (
  "id" SERIAL NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "author" VARCHAR(255) NOT NULL,
  "isbn" VARCHAR(50) NOT NULL,
  "publish_year" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "borrow_records" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "book_id" INTEGER NOT NULL,
  "borrow_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "due_date" TIMESTAMP(3) NOT NULL,
  "return_date" TIMESTAMP(3),
  "status" "BorrowStatus" NOT NULL DEFAULT 'BORROWED',
  CONSTRAINT "borrow_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");
CREATE INDEX "books_title_idx" ON "books"("title");
CREATE INDEX "borrow_records_user_id_idx" ON "borrow_records"("user_id");
CREATE INDEX "borrow_records_book_id_idx" ON "borrow_records"("book_id");

ALTER TABLE "borrow_records"
  ADD CONSTRAINT "borrow_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "borrow_records"
  ADD CONSTRAINT "borrow_records_book_id_fkey"
  FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;