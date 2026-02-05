import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1770240180365 implements MigrationInterface {
  name = 'Migrations1770240180365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wallet" ("wallet_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "balance" integer NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'NGN', "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8de7b77bd9e13f461f65937f67a" PRIMARY KEY ("wallet_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'abandoned', 'failed', 'completed', 'success', 'reversed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_type_enum" AS ENUM('funding', 'conversion', 'trade', 'withdrawal', 'fee')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_flow_enum" AS ENUM('debit', 'credit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("transaction_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "wallet_id" character varying NOT NULL, "session_id" character varying, "currency" character varying NOT NULL, "reference" character varying NOT NULL, "amount" integer NOT NULL, "description" character varying NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'pending', "type" "public"."transaction_type_enum" NOT NULL DEFAULT 'funding', "exchange_rate" integer NOT NULL, "flow" "public"."transaction_flow_enum" NOT NULL, "is_transfer" boolean NOT NULL DEFAULT false, "is_disputed" boolean NOT NULL DEFAULT false, "dispute_details" text, "dispute_resources" text, "metadata" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6e02e5a0a6a7400e1c944d1e946" PRIMARY KEY ("transaction_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('inactive', 'active', 'deleted', 'incomplete_profile', 'suspended', 'pending', 'locked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "full_name" character varying NOT NULL, "last_name" character varying NOT NULL, "middle_name" character varying, "email" character varying NOT NULL, "email_confirmation_token" character varying NOT NULL, "email_confirmation_sent_at" bigint NOT NULL, "email_confirmation_expires_at" bigint NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "gender" "public"."users_gender_enum", "status" "public"."users_status_enum" NOT NULL DEFAULT 'inactive', "password" character varying NOT NULL, "login_times" text DEFAULT '[]', "login_attempts" integer NOT NULL DEFAULT '0', "password_changed_at" bigint, "reset_password_token" character varying, "reset_password_token_expires" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "phoneNumberCountry_code" character varying NOT NULL, "phoneNumberPhone" character varying NOT NULL, "addressInfoHouse_number" character varying, "addressInfoStreet" character varying, "addressInfoLandmark" character varying, "addressInfoLga" character varying, "addressInfoState" character varying, "addressInfoZip_code" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_11578458af1c9eca751dc5af321" UNIQUE ("email_confirmation_token"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admin_users_gender_enum" AS ENUM('male', 'female', 'not_set')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admin_users_status_enum" AS ENUM('active', 'inactive', 'suspended', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_users" ("admin_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "first_name" character varying, "full_name" character varying, "last_name" character varying, "middle_name" character varying, "address" character varying, "country_code" character varying, "phone_number" character varying, "gender" "public"."admin_users_gender_enum" NOT NULL DEFAULT 'not_set', "status" "public"."admin_users_status_enum" NOT NULL DEFAULT 'active', "image" character varying, "password" character varying, "password_changed_at" bigint, "login_times" text DEFAULT '[]', "login_attempts" integer NOT NULL DEFAULT '0', "reset_password_token" character varying, "reset_password_sent_at" TIMESTAMP, "reset_password_token_expires" bigint, "jti" character varying, "is_default" boolean NOT NULL DEFAULT false, "role_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dcd0c8a4b10af9c986e510b9ecc" UNIQUE ("email"), CONSTRAINT "PK_8854d77279ef5e35c0f55a0f483" PRIMARY KEY ("admin_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("role_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_35c9b140caaf6da09cfabb0d675" UNIQUE ("slug"), CONSTRAINT "PK_df46160e6aa79943b83c81e496e" PRIMARY KEY ("role_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("permission_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "entity" character varying NOT NULL, "action" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3379e3b123dac5ec10734b8cc86" UNIQUE ("slug"), CONSTRAINT "PK_aaa6d61e22fb453965ae6157ce5" PRIMARY KEY ("permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activities" ("activity_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_id" character varying NOT NULL, "entity" character varying NOT NULL, "resource" character varying NOT NULL, "event" character varying NOT NULL, "activity" character varying NOT NULL, "ip_address" character varying NOT NULL, "event_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deviceInfoBrowser" character varying, "deviceInfoOs" character varying, "deviceInfoVersion" character varying, CONSTRAINT "PK_1ca2c10152039da7b4c08744ab9" PRIMARY KEY ("activity_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "country_code" character varying, "language" character varying NOT NULL, "cca2" character varying NOT NULL, "ccn3" character varying, "cca3" character varying NOT NULL, "cioc" character varying, "currency" character varying NOT NULL, "currency_symbol" character varying NOT NULL, "flag" character varying NOT NULL, "version" bigint NOT NULL, "is_deleted" boolean NOT NULL, "exchange_rate" character varying, "currency_code" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ebee5bbe89c69ffc407da6d0369" UNIQUE ("cca2"), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("roleRoleId" uuid NOT NULL, "permissionPermissionId" uuid NOT NULL, CONSTRAINT "PK_241347843350aff69b30b6fbb98" PRIMARY KEY ("roleRoleId", "permissionPermissionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_399ef1c33bd9e8208fd7978034" ON "role_permissions" ("roleRoleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79ae6a0037dbb464a101178a00" ON "role_permissions" ("permissionPermissionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_users" ADD CONSTRAINT "FK_4fd00bf1bafe85885a51d3da925" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_399ef1c33bd9e8208fd79780344" FOREIGN KEY ("roleRoleId") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_79ae6a0037dbb464a101178a00b" FOREIGN KEY ("permissionPermissionId") REFERENCES "permission"("permission_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_79ae6a0037dbb464a101178a00b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_399ef1c33bd9e8208fd79780344"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_users" DROP CONSTRAINT "FK_4fd00bf1bafe85885a51d3da925"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_b4a3d92d5dde30f3ab5c34c5862"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79ae6a0037dbb464a101178a00"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_399ef1c33bd9e8208fd7978034"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "admin_users"`);
    await queryRunner.query(`DROP TYPE "public"."admin_users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."admin_users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_flow_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TABLE "wallet"`);
  }
}
