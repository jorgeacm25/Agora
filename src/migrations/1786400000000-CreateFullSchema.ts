import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFullSchema1786400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar extensión UUID (si no está)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 2. Tabla users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(100) NOT NULL,
        "password" character varying(255),
        "permissions" json DEFAULT '[]',
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    // 3. Tabla user_enterprises (depende de users)
    await queryRunner.query(`
      CREATE TABLE "user_enterprises" (
        "idUserEnterprise" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "companyName" character varying(200) NOT NULL,
        "address" jsonb,
        "contact" jsonb,
        "officeHours" TIMESTAMP,
        "code" bigint,
        CONSTRAINT "PK_user_enterprises" PRIMARY KEY ("idUserEnterprise"),
        CONSTRAINT "FK_user_enterprises_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // 4. Tabla products (depende de user_enterprises)
    await queryRunner.query(`
      CREATE TABLE "products" (
        "idProduct" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "priceCup" numeric(10,2),
        "priceUsd" numeric(10,2),
        "image" character varying(255),
        "description" text NOT NULL,
        "unit" character varying(50) NOT NULL,
        "stock" boolean NOT NULL DEFAULT true,
        "category" character varying(100) NOT NULL,
        "userEnterpriseId" uuid NOT NULL,
        CONSTRAINT "PK_products" PRIMARY KEY ("idProduct"),
        CONSTRAINT "FK_products_userEnterprise" FOREIGN KEY ("userEnterpriseId") REFERENCES "user_enterprises"("idUserEnterprise") ON DELETE CASCADE
      )
    `);

    // 5. Tabla subscriptions (depende de users)
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "idSubscription" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "name" character varying(100) NOT NULL,
        "cost" numeric(10,2) NOT NULL,
        "description" text,
        "status" boolean NOT NULL DEFAULT true,
        "quantityAccounts" integer NOT NULL,
        "duration_days" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMP,
        "last_checked_at" TIMESTAMP,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("idSubscription"),
        CONSTRAINT "FK_subscriptions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // 6. Índices para mejorar rendimiento
    await queryRunner.query(`CREATE INDEX "IDX_products_userEnterpriseId" ON "products" ("userEnterpriseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_userId" ON "subscriptions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_expires_at" ON "subscriptions" ("expires_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_enterprises_userId" ON "user_enterprises" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar en orden inverso (respetando FK)
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_enterprises"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}