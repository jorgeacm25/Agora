import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToUserEnterprise1786894405936 implements MigrationInterface {
    name = 'AddLocationToUserEnterprise1786894405936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" ADD "longitude" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "user_enterprises" DROP COLUMN "latitude"`);
    }

}
