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

## Configuración del Proyecto

```bash
$ npm install
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
