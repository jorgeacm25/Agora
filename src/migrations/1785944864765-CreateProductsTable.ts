import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1785944864765 implements MigrationInterface {
    name = 'CreateProductsTable1785944864765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_359bd8406fbfb50e3ea42b5631f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "available"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "photoPublicId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "businessId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "idProduct" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "PK_806d889fe45683f13794b83f3ce" PRIMARY KEY ("idProduct")`);
        await queryRunner.query(`ALTER TABLE "products" ADD "priceCup" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "priceUsd" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "unit" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "userEnterpriseId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_85972efa1e5c4e3908ddfb01404" FOREIGN KEY ("userEnterpriseId") REFERENCES "user_enterprises"("idUserEnterprise") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_85972efa1e5c4e3908ddfb01404"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "name" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "userEnterpriseId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "priceUsd"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "priceCup"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "PK_806d889fe45683f13794b83f3ce"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "idProduct"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD "businessId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "photoPublicId" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "photo" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "available" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" USING btree ("name") `);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_359bd8406fbfb50e3ea42b5631f" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
