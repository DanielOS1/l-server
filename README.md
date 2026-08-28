<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Lolos App Server

Backend para la aplicación de gestión de grupos, actividades y roles. Esta aplicación permite a organizaciones o grupos gestionar sus miembros, definir ciclos operativos (semestres) y coordinar actividades con asignación de responsables.

## Descripción General

Lolos App está diseñada para facilitar la administración de grupos de personas que operan por ciclos definidos. Permite:

- **Gestión de Grupos**: Crear espacios colaborativos con miembros y roles.
- **Ciclos Temporales (Semestres)**: Organizar el trabajo en períodos de tiempo claros.
- **Actividades y Eventos**: Planificar hitos dentro de cada ciclo.
- **Asignación de Cargos**: Definir responsabilidades específicas (Cargos) y asignar miembros a ellas para cada actividad.

## Módulos del Sistema

Cada módulo encapsula lógica de negocio específica y expone una API REST.

### 1. Auth (Autenticación)

Gestiona la seguridad y el acceso al sistema.

- **Registro**: Creación de nuevas cuentas de usuario.
- **Login**: Autenticación vía correo y contraseña, emitiendo JWT (JSON Web Tokens).
- **Protección**: Guards para asegurar endpoints.

### 2. User (Usuarios)

Maneja la información de perfil de los usuarios.

- **Perfil**: Datos personales (Nombre, RUT, ocupación, etc.).
- **Búsqueda**: Identificación de usuarios para invitaciones.

### 3. Group (Grupos)

El núcleo de la organización.

- **Creación**: Los usuarios pueden crear grupos y convertirse en **Owners**.
- **Membresía**: Gestión de miembros (invitar, remover).
- **Roles de Grupo**: Definición de permisos dentro del grupo (ej. quién puede crear actividades).

### 4. Semester (Períodos)

Divide la línea de tiempo del grupo en bloques manejables.

- **Definición**: Fecha de inicio y fin (ej. "Primer Semestre 2026").
- **Estado**: Activo/Inactivo.
- **Utilidad**: Permite filtrar actividades y cargos por contexto temporal.

### 5. Activity (Actividades)

Eventos concretos que ocurren dentro de un semestre.

- **Datos**: Nombre, fecha, ubicación, descripción.
- **Validación**: La fecha de la actividad debe estar dentro del rango del semestre asociado.

### 6. Position (Cargos)

Responsabilidades operativas definidas por semestre.

- **Ejemplos**: "Coordinador de Logística", "Tesorero", "Encargado de Asado".
- **Contexto**: Un cargo pertenece a un semestre, lo que permite renovar responsabilidades cada ciclo.

### 7. Assignment (Asignaciones)

El vínculo entre usuarios, cargos y actividades.

- **Función**: Asigna a un usuario específico a un cargo (Position) para una actividad (Activity) determinada.
- **Regla**: La actividad y el cargo deben pertenecer al mismo semestre.

---

## Stack Técnico

- **Framework**: [NestJS](https://nestjs.com/) (Node.js + TypeScript)
- **Base de datos**: PostgreSQL, vía [TypeORM](https://typeorm.io/) con migraciones (sin `synchronize`)
- **Autenticación**: JWT (`@nestjs/jwt`, `passport-jwt`) + `bcrypt` para hashing de contraseñas
- **Validación**: `class-validator` / `class-transformer`
- **Seguridad**: `helmet`, `@nestjs/throttler`, CORS configurado por variable de entorno
- **Contenedores**: Docker (build multi-stage)

## Configuración del Proyecto

```bash
$ npm install
```

Copia `.env.example` a `.env` y completa los valores:

```bash
$ cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión completa a Postgres (tiene prioridad si está definida) |
| `DATABASE_HOST` / `PORT` / `USERNAME` / `PASSWORD` / `NAME` | Alternativa a `DATABASE_URL`, usada en desarrollo local |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |
| `JWT_EXPIRATION` | Tiempo de expiración del token (ej. `7d`) |
| `PORT` | Puerto donde escucha el servidor |
| `FRONTEND_URL` | Origen permitido por CORS |

### Base de datos local con Docker

El repo incluye un `docker-compose.yml` con una instancia de Postgres para desarrollo:

```bash
$ docker compose up -d
```

Levanta un contenedor `postgres:15` en `localhost:5432` con las credenciales por defecto del `.env.example`.

### Migraciones

```bash
# crear una migración vacía
$ npm run typeorm:create-migration -- NombreDeLaMigracion

# generar una migración a partir de cambios en las entities
$ npm run typeorm:generate-migration -- NombreDeLaMigracion

# aplicar migraciones pendientes
$ npm run typeorm:run-migrations

# revertir la última migración
$ npm run typeorm:revert-migration
```

## Ejecución

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Pruebas

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Despliegue

El backend está desplegado en **Google Cloud Run**, dentro del proyecto `lolosapp-prod1`. La base de datos PostgreSQL corre en **Neon**, fuera de Google Cloud.

Componentes usados en el proyecto de GCP:

- **Cloud Run**: ejecuta el contenedor de la API.
- **Artifact Registry** (`lolosapp-repo`): almacena la imagen Docker. La imagen se construye y sube localmente con `docker build` / `docker push` (Cloud Build quedó habilitado en el proyecto pero no se usa en el flujo actual).
- **Secret Manager**: guarda `database-url` y `jwt-secret`, inyectados como variables de entorno en el servicio de Cloud Run.
- **Neon**: hosting de la base de datos Postgres, conectada vía `DATABASE_URL`.
