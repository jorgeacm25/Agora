import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBusinessTypeTable1784818452338 implements MigrationInterface {
    name = 'CreateBusinessTypeTable1784818452338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "business_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "pay_cant" numeric(10,2) NOT NULL DEFAULT '0', "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3894005288e759379ee7b56622a" UNIQUE ("name"), CONSTRAINT "PK_3c34c2b0b96fd7d13d7b4750b27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3894005288e759379ee7b56622" ON "business_types"  ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3894005288e759379ee7b56622"`);
        await queryRunner.query(`DROP TABLE "business_types"`);
    }

}
