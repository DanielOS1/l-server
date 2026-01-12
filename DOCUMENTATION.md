# Documentación del Proyecto L-APP (Backend)

## Introducción
Este documento proporciona una visión general del estado actual del backend del proyecto L-APP, explicando su lógica de negocio, arquitectura modular y estructura de base de datos. El proyecto está construido utilizando **NestJS**, un framework de Node.js, y utiliza **TypeORM** para la interacción con una base de datos **PostgreSQL**.

## Estado del Proyecto
El proyecto se encuentra en una etapa de desarrollo funcional. La estructura base está implementada siguiendo buenas prácticas de arquitectura modular.
- **Framework**: NestJS (Modular, TypeScript).
- **ORM**: TypeORM.
- **Base de Datos**: PostgreSQL.
- **Autenticación**: JWT (Passport).

## Lógica de Negocio
El sistema parece estar diseñado para la **gestión académica o de voluntariado**, permitiendo la administración de usuarios, grupos y la asignación de personas a actividades específicas bajo ciertos roles o cargos.

El flujo principal gira en torno a:
1.  **Usuarios y Grupos**: Los usuarios se registran y se organizan en grupos.
2.  **Roles y Permisos**: Se definen roles con permisos específicos (sistema RBAC) que se asignan a los usuarios dentro de los grupos.
3.  **Planificación Académica/Temporal**: Existen "Semestres" que agrupan actividades.
4.  **Asignaciones (Assignments)**: Es el núcleo operativo. Un usuario es "asignado" a una "Actividad" específica, ocupando un "Cargo" (Position) determinado.

### Ejemplo de Uso
Un usuario (Estudiante) pertenece a un grupo (Generación 2024). En el Semestre "Otoño 2024", se crea una Actividad "Feria de Ciencias". El usuario es asignado a esta actividad con el Cargo de "Coordinador Logístico".

## Módulos del Sistema

A continuación se describen los módulos principales identificados en `src/`:

### 1. Auth (Autenticación)
- **Función**: Maneja el registro y el inicio de sesión de los usuarios.
- **Detalle**: Utiliza JWT (JSON Web Tokens) para asegurar los endpoints. Probablemente gestiona la validación de contraseñas y la emisión de tokens.

### 2. User (Usuarios)
- **Función**: Gestión de perfiles de usuario.
- **Entidad Principal**: `User`.
- **Datos**: Almacena RUT, nombre, correo, ocupación, teléfono, dirección, etc.
- **Conexiones**: Se conecta con casi todos los demás módulos (Grupos, Roles, Asignaciones).

### 3. Group (Grupos)
- **Función**: Organización de usuarios en colectivos.
- **Entidad Principal**: `Group`.
- **Relación**: Un usuario pertenece a grupos a través de la entidad intermedia `UserGroup`.
- **Roles en Grupo**: Mediante `UserGroupRole`, se pueden asignar roles específicos a un usuario dentro de un grupo (ej. un usuario puede ser "Líder" en un grupo y "Miembro" en otro).

### 4. Role (Roles)
- **Función**: Definición de perfiles de acceso y permisos.
- **Entidad Principal**: `Role`.
- **Detalles**: Permite definir roles globales o de sistema. Almacena permisos en formato JSON (`permissions`).
- **Conexión**: Los roles son creados por usuarios y asignados a usuarios dentro de los grupos.

### 5. Semester (Semestre)
- **Función**: Unidad temporal para organizar actividades.
- **Entidad Principal**: `Semester`.
- **Uso**: Agrupa actividades y cargos disponibles para un periodo de tiempo.

### 6. Activity (Actividades)
- **Función**: Eventos o tareas específicas.
- **Entidad Principal**: `Activity`.
- **Datos**: Nombre, fecha, ubicación.
- **Conexión**: Pertenece a un `Semester`.

### 7. Position (Cargos)
- **Función**: Definición de puestos o responsabilidades.
- **Entidad Principal**: `Position`.
- **Datos**: Nombre del cargo, descripción.
- **Conexión**: Asociado a un `Semester`.

### 8. Assignment (Asignaciones)
- **Función**: Vinculación operativa.
- **Entidad Principal**: `Assignment`.
- **Lógica**: Une a un **Usuario** + **Actividad** + **Cargo**.
- **Ejemplo**: Usuario X es [Voluntario] en la [Actividad Y].

## Base de Datos (Mapeo Relacional)

La base de datos maneja las siguientes relaciones clave:

- **Users** ↔ **Groups** (Muchos a Muchos): Implementado a través de `user_groups`.
- **Users** ↔ **Roles**: A través de `user_group_roles` (permitiendo roles contextuales por grupo).
- **Semesters** ↔ **Activities**: Un semestre tiene muchas actividades (1:N).
- **Semesters** ↔ **Positions**: Un semestre tiene muchos cargos definidos (1:N).
- **Assignments**: Tabla pivote central que conecta `User`, `Activity` y `Position`.

### Tablas Principales (Identificadas)
- `user`
- `roles`
- `groups`
- `user_groups`
- `user_group_roles`
- `semesters` (inferida)
- `activities`
- `positions`
- `assignments`

---
*Generado automáticamente por Antigravity a partir del análisis del código fuente.*
