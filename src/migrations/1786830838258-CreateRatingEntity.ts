import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRatingEntity1786830838258 implements MigrationInterface {
    name = 'CreateRatingEntity1786830838258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("idService" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "priceCup" numeric(10,2), "priceUsd" numeric(10,2), "description" text NOT NULL, "userEnterpriseId" uuid NOT NULL, CONSTRAINT "PK_680a39e0f4f7df3b329ac06d0ee" PRIMARY KEY ("idService"))`);
        await queryRunner.query(`CREATE TABLE "ratings" ("idRating" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "userId" uuid NOT NULL, "productId" uuid, "serviceId" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_4922715adc93ee98876530a947" CHECK ("quantity" >= 1 AND "quantity" <= 5), CONSTRAINT "PK_6204ddd6b2fda059290f85a868c" PRIMARY KEY ("idRating"))`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_d656640c2430cc7f974513b23ad" FOREIGN KEY ("userEnterpriseId") REFERENCES "user_enterprises"("idUserEnterprise") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_abcea824a43708933e5ac15a0e4" FOREIGN KEY ("productId") REFERENCES "products"("idProduct") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_19f05e4a7e2cc589584e3ac2693" FOREIGN KEY ("serviceId") REFERENCES "services"("idService") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_19f05e4a7e2cc589584e3ac2693"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_abcea824a43708933e5ac15a0e4"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_d656640c2430cc7f974513b23ad"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
