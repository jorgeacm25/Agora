import { MigrationInterface, QueryRunner } from "typeorm";

export class MergeUserAndUserEnterprise1785941467061 implements MigrationInterface {
    name = 'MergeUserAndUserEnterprise1785941467061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_enterprises" ("idUserEnterprise" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "companyName" character varying(200) NOT NULL, "address" jsonb, "contact" jsonb, "officeHours" TIMESTAMP, "code" bigint, CONSTRAINT "REL_91e90d200b1f8a7ef4f2ecac75" UNIQUE ("userId"), CONSTRAINT "PK_97ff5760c4acf0563746c99c482" PRIMARY KEY ("idUserEnterprise"))`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP CONSTRAINT "FK_91e90d200b1f8a7ef4f2ecac757"`);
        await queryRunner.query(`DROP TABLE "user_enterprises"`);
    }

}
