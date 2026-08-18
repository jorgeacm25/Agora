import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeTuMigracion1787061717360 implements MigrationInterface {
    name = 'NombreDeTuMigracion1787061717360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("idProduct" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "priceCup" numeric(10,2), "priceUsd" numeric(10,2), "image" character varying(255), "description" text NOT NULL, "unit" character varying(50) NOT NULL, "stock" boolean NOT NULL DEFAULT true, "category" character varying(100) NOT NULL, "userEnterpriseId" uuid NOT NULL, CONSTRAINT "PK_806d889fe45683f13794b83f3ce" PRIMARY KEY ("idProduct"))`);
        await queryRunner.query(`CREATE TABLE "services" ("idService" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "priceCup" numeric(10,2), "priceUsd" numeric(10,2), "description" text NOT NULL, "userEnterpriseId" uuid NOT NULL, CONSTRAINT "PK_680a39e0f4f7df3b329ac06d0ee" PRIMARY KEY ("idService"))`);
        await queryRunner.query(`CREATE TABLE "accounts" ("idAccount" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "name" character varying(100) NOT NULL, "description" text, "accountType" character varying(50) NOT NULL, "account_number" character varying(50) NOT NULL, "balance" numeric(15,2) NOT NULL DEFAULT '0', "initial_balance" numeric(15,2) NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL DEFAULT 'USD', "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "last_activity_at" TIMESTAMP, CONSTRAINT "UQ_ffd1ae96513bfb2c6eada0f7d31" UNIQUE ("account_number"), CONSTRAINT "REL_3aa23c0a6d107393e8b40e3e2a" UNIQUE ("userId"), CONSTRAINT "PK_3904a44eb589719e28107aaffc5" PRIMARY KEY ("idAccount"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_85972efa1e5c4e3908ddfb01404" FOREIGN KEY ("userEnterpriseId") REFERENCES "user_enterprises"("idUserEnterprise") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_d656640c2430cc7f974513b23ad" FOREIGN KEY ("userEnterpriseId") REFERENCES "user_enterprises"("idUserEnterprise") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_d656640c2430cc7f974513b23ad"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_85972efa1e5c4e3908ddfb01404"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
