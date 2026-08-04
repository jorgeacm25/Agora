import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPermissions1785780940656 implements MigrationInterface {
    name = 'AddUserPermissions1785780940656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "permissions" json DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "permissions"`);
    }

}
