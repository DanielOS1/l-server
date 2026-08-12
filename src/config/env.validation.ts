const REQUIRED_VARS = ['JWT_SECRET', 'JWT_EXPIRATION', 'FRONTEND_URL'];

const INDIVIDUAL_DB_VARS = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missing = REQUIRED_VARS.filter((key) => !config[key]);

  const hasDatabaseUrl = !!config.DATABASE_URL;
  const hasIndividualDbVars = INDIVIDUAL_DB_VARS.every((key) => !!config[key]);
  if (!hasDatabaseUrl && !hasIndividualDbVars) {
    missing.push(
      'DATABASE_URL (o las variables DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME)',
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}`,
    );
  }

  return config;
}
