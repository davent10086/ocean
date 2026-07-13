-- 用户表增加 disabled 字段，用于禁用/启用账号
ALTER TABLE "users" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false;
