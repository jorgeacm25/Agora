import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBusinessTable1784819455491 implements MigrationInterface {
    name = 'CreateBusinessTable1784819455491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "businesses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "address" character varying(500) NOT NULL, "phone" character varying(20), "email" character varying(100), "website" character varying(100), "description" text, "isActive" boolean NOT NULL DEFAULT true, "businessTypeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31e657169754a8feaa08c17bc2" ON "businesses"  ("name") `);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_01845bacd013698b8bffb920933" FOREIGN KEY ("businessTypeId") REFERENCES "business_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_01845bacd013698b8bffb920933"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31e657169754a8feaa08c17bc2"`);
        await queryRunner.query(`DROP TABLE "businesses"`);
    }

}
