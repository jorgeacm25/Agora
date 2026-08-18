import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionsTable1786397964195 implements MigrationInterface {
    name = 'CreateSubscriptionsTable1786397964195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("idSubscription" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "name" character varying(100) NOT NULL, "cost" numeric(10,2) NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, "quantityAccounts" integer NOT NULL, "duration_days" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "last_checked_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "REL_fbdba4e2ac694cf8c9cecf4dc8" UNIQUE ("userId"), CONSTRAINT "PK_f20d392cf4acabf21c2796b4a0a" PRIMARY KEY ("idSubscription"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
