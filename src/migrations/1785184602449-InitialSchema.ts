import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785184602449 implements MigrationInterface {
  name = 'InitialSchema1785184602449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isDefault" boolean NOT NULL DEFAULT false, "level" integer NOT NULL DEFAULT '10', "isSystem" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" uuid, CONSTRAINT "PK_c88b2351f40bf170bc7ab7e8fda" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '1', "activityId" uuid, "positionId" uuid, CONSTRAINT "PK_35f9b6b0d8069992d6bd4d38681" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" text, "semesterId" uuid, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notes" text, "activityId" uuid, "positionId" uuid, "userId" uuid, CONSTRAINT "PK_c54ca359535e0012b04dcbd80ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "date" TIMESTAMP NOT NULL, "description" text, "location" character varying(200) NOT NULL, "semesterId" uuid, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "semester" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "groupId" uuid, CONSTRAINT "PK_9129c1fd35aa4aded7a9825b38d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale_rows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "addedByUserId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "saleId" uuid, "addedById" uuid, CONSTRAINT "PK_8fc5a4d4018f259c00c6ef7551e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" text NOT NULL, "rowId" uuid, "columnId" uuid, CONSTRAINT "PK_abfd70099a509c2ca6db9018bcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sale_columns_type_enum" AS ENUM('TEXT', 'NUMBER', 'DATE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sale_columns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "type" "public"."sale_columns_type_enum" NOT NULL, "isRequired" boolean NOT NULL DEFAULT false, "isFunctionalAmount" boolean NOT NULL DEFAULT false, "orderIndex" integer NOT NULL DEFAULT '0', "saleId" uuid, CONSTRAINT "PK_772678c397fb2256d69bce496d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "date" TIMESTAMP NOT NULL, "location" character varying(200), "totalAmount" numeric(12,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "goalId" uuid, CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "purpose" character varying(200), "targetAmount" numeric(12,2) NOT NULL, "currentAmount" numeric(12,2) NOT NULL DEFAULT '0', "startDate" date NOT NULL, "endDate" date, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" uuid, CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "extraData" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "groupRoleId" uuid, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isCreator" boolean NOT NULL DEFAULT false, "userId" uuid, "groupId" uuid, "groupRoleId" uuid, CONSTRAINT "PK_ea7760dc75ee1bf0b09ab9b3289" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "rut" character varying(20) NOT NULL, "occupation" character varying(100), "phone" character varying(20), "address" character varying(200), "birthDate" date, "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f839e522b3b8c8c8223cde81db" UNIQUE ("rut"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notices_level_enum" AS ENUM('NORMAL', 'IMPORTANT', 'URGENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "description" text NOT NULL, "level" "public"."notices_level_enum" NOT NULL DEFAULT 'NORMAL', "isSent" boolean NOT NULL DEFAULT false, "sentAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid NOT NULL, "groupId" uuid NOT NULL, CONSTRAINT "PK_3eb18c29da25d6935fcbe584237" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "permissions" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_roles" ADD CONSTRAINT "FK_2b5f930e296a7d2bf3b14e59f42" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_positions" ADD CONSTRAINT "FK_44cbdd6df0b1108702e0e71b678" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_positions" ADD CONSTRAINT "FK_ba5f3597604a67fd704cf0ef623" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "positions" ADD CONSTRAINT "FK_e834f3cd7c1a1e37624923cf5fe" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_a611e3438efae54f7058c14b238" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_8dc72ed8923acfe72a5bb27c7b4" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_a6f942932652357658b130088ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_49d43cdbf616c4466c39360de70" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "semester" ADD CONSTRAINT "FK_d864d312adca1d2d76f71a86f25" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_rows" ADD CONSTRAINT "FK_4711103019542619bcbb9f9551a" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_rows" ADD CONSTRAINT "FK_27dc95179908a37c1265e9e9159" FOREIGN KEY ("addedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_values" ADD CONSTRAINT "FK_4701408013725e500df8e6ff306" FOREIGN KEY ("rowId") REFERENCES "sale_rows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_values" ADD CONSTRAINT "FK_446f36a62318ddd3b1a5c7c87c6" FOREIGN KEY ("columnId") REFERENCES "sale_columns"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_columns" ADD CONSTRAINT "FK_8cc69134c1d5dbe847de3419574" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD CONSTRAINT "FK_97b7b065bccd7485eef2c9b3a4d" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ADD CONSTRAINT "FK_1924893a31d0e5a96e7b54ecdf5" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_1baf5d7ab589e05fd8ccd73a247" FOREIGN KEY ("groupRoleId") REFERENCES "group_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" ADD CONSTRAINT "FK_99d01ff7f143377c044f3d6c955" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" ADD CONSTRAINT "FK_4dcea3f5c6f04650517d9dc4750" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" ADD CONSTRAINT "FK_b82bbd5507d23838c235ceff8af" FOREIGN KEY ("groupRoleId") REFERENCES "group_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notices" ADD CONSTRAINT "FK_93bba5037af88c249003f0d389c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notices" ADD CONSTRAINT "FK_ac580f0f4223e503ba27565daf1" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notices" DROP CONSTRAINT "FK_ac580f0f4223e503ba27565daf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notices" DROP CONSTRAINT "FK_93bba5037af88c249003f0d389c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_b82bbd5507d23838c235ceff8af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_4dcea3f5c6f04650517d9dc4750"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_99d01ff7f143377c044f3d6c955"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_1baf5d7ab589e05fd8ccd73a247"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" DROP CONSTRAINT "FK_1924893a31d0e5a96e7b54ecdf5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP CONSTRAINT "FK_97b7b065bccd7485eef2c9b3a4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_columns" DROP CONSTRAINT "FK_8cc69134c1d5dbe847de3419574"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_values" DROP CONSTRAINT "FK_446f36a62318ddd3b1a5c7c87c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_values" DROP CONSTRAINT "FK_4701408013725e500df8e6ff306"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_rows" DROP CONSTRAINT "FK_27dc95179908a37c1265e9e9159"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sale_rows" DROP CONSTRAINT "FK_4711103019542619bcbb9f9551a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "semester" DROP CONSTRAINT "FK_d864d312adca1d2d76f71a86f25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_49d43cdbf616c4466c39360de70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_a6f942932652357658b130088ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_8dc72ed8923acfe72a5bb27c7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_a611e3438efae54f7058c14b238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "positions" DROP CONSTRAINT "FK_e834f3cd7c1a1e37624923cf5fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_positions" DROP CONSTRAINT "FK_ba5f3597604a67fd704cf0ef623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_positions" DROP CONSTRAINT "FK_44cbdd6df0b1108702e0e71b678"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_roles" DROP CONSTRAINT "FK_2b5f930e296a7d2bf3b14e59f42"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "notices"`);
    await queryRunner.query(`DROP TYPE "public"."notices_level_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_groups"`);
    await queryRunner.query(`DROP TABLE "groups"`);
    await queryRunner.query(`DROP TABLE "goals"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TABLE "sale_columns"`);
    await queryRunner.query(`DROP TYPE "public"."sale_columns_type_enum"`);
    await queryRunner.query(`DROP TABLE "sale_values"`);
    await queryRunner.query(`DROP TABLE "sale_rows"`);
    await queryRunner.query(`DROP TABLE "semester"`);
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "assignments"`);
    await queryRunner.query(`DROP TABLE "positions"`);
    await queryRunner.query(`DROP TABLE "activity_positions"`);
    await queryRunner.query(`DROP TABLE "group_roles"`);
  }
}
