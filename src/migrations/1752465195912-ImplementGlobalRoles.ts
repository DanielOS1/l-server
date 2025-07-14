import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementGlobalRoles1752465195912 implements MigrationInterface {

public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Añadir columna isGlobal
    await queryRunner.query(`
      ALTER TABLE roles 
      ADD COLUMN IF NOT EXISTS "isGlobal" boolean DEFAULT true
    `);

    // 2. Normalizar roles Administrador
    await this.normalizeRoles(queryRunner, 'Administrador');
    
    // 3. Normalizar roles Miembro
    await this.normalizeRoles(queryRunner, 'Miembro');
  }

  private async normalizeRoles(queryRunner: QueryRunner, roleName: string) {
    // 2.1 Encontrar el rol más antiguo
    const [oldestRole] = await queryRunner.query(`
      SELECT id FROM roles 
      WHERE name = $1 
      ORDER BY "createdAt" ASC 
      LIMIT 1
    `, [roleName]);

    if (oldestRole) {
      // 2.2 Actualizar relaciones a usar este rol
      await queryRunner.query(`
        UPDATE user_group_roles
        SET "roleId" = $1
        WHERE "roleId" IN (
          SELECT id FROM roles 
          WHERE name = $2 AND id != $1
        )
      `, [oldestRole.id, roleName]);

      // 2.3 Eliminar duplicados
      await queryRunner.query(`
        DELETE FROM roles 
        WHERE name = $1 AND id != $2
      `, [roleName, oldestRole.id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reversión (opcional)
    await queryRunner.query(`
      ALTER TABLE roles 
      DROP COLUMN "isGlobal"
    `);
  }
}
