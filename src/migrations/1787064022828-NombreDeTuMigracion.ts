import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeTuMigracion1787064022828 implements MigrationInterface {
    name = 'NombreDeTuMigracion1787064022828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."auth_identities_provider_enum" AS ENUM('password', 'google', 'facebook')`);
        await queryRunner.query(`CREATE TABLE "auth_identities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "provider" "public"."auth_identities_provider_enum" NOT NULL, "providerUserId" character varying(255), "passwordHash" character varying(255), "emailVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e2afaeac776db523ee689bfdf9a" UNIQUE ("provider", "providerUserId"), CONSTRAINT "PK_63a29aebcddd09448dbeee4666b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "auth_identities" ADD CONSTRAINT "FK_6ed26ac7e2276ae145ca68c23af" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_identities" DROP CONSTRAINT "FK_6ed26ac7e2276ae145ca68c23af"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255)`);
        await queryRunner.query(`DROP TABLE "auth_identities"`);
        await queryRunner.query(`DROP TYPE "public"."auth_identities_provider_enum"`);
    }

}
