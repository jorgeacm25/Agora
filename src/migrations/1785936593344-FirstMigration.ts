import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1785936593344 implements MigrationInterface {
    name = 'FirstMigration1785936593344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "idSubscription"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP CONSTRAINT "PK_25ae13cea34437d087a123ec5bc"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "idUserEnterprise" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD CONSTRAINT "PK_97ff5760c4acf0563746c99c482" PRIMARY KEY ("idUserEnterprise")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "companyName"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "companyName" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "companyName"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "companyName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP CONSTRAINT "PK_97ff5760c4acf0563746c99c482"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "idUserEnterprise"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD CONSTRAINT "PK_25ae13cea34437d087a123ec5bc" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "idSubscription" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

}
