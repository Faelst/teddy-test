-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Url" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "hits" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UrlAccess" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "idx_user_email_active" ON "public"."User"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Url_code_key" ON "public"."Url"("code");

-- CreateIndex
CREATE INDEX "idx_url_code_active" ON "public"."Url"("code", "deletedAt");

-- CreateIndex
CREATE INDEX "idx_url_user_active_created" ON "public"."Url"("userId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "UrlAccess_urlId_createdAt_idx" ON "public"."UrlAccess"("urlId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Url" ADD CONSTRAINT "Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UrlAccess" ADD CONSTRAINT "UrlAccess_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "public"."Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
