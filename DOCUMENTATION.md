# Documentación del Proyecto L-APP (Backend)

## Introducción

Este documento detalla la estructura, lógica de negocio y estado actual del backend del proyecto **L-APP**. El sistema está construido sobre **NestJS** (Node.js) y utiliza **PostgreSQL** con **TypeORM** para la persistencia de datos. Su objetivo principal es la gestión de organizaciones (grupos), miembros, actividades académicas o de voluntariado, y el control de finanzas básicas.

## Estado del Proyecto

El proyecto cuenta con una arquitectura modular sólida y funcional.

- **Tecnologías**: NestJS, TypeScript, TypeORM, PostgreSQL, Passport/JWT.
- **Estructura**: Modular (Carpeta `src` dividida por dominios).
- **Cobertura**: Autenticación, Gestión de Usuarios, Grupos, Roles (RBAC granular), Actividades, Asignaciones y Finanzas.

---

## Módulos y Lógica de Negocio

### 1. Sistema de Roles y Permisos (Jerarquía)

El sistema maneja permisos en tres niveles distintos, lo cual es vital para entender el flujo de autorización.

#### A. Nivel Aplicación / Sistema (Global)

- **Módulo**: `src/system/role`
- **Entidad**: `Role`
- **Descripción**: Define roles globales (ej. "Super Admin", "Usuario Sistema"). Contiene un campo `permissions` (JSON) para configurar capacidades técnicas finas.
- **Estado Actual**: Aunque la entidad existe y se pueden definir roles, no se observa una asignación directa activa en la entidad `User` (la relación no está explícita en el código actual del usuario). Es probable que esté en desarrollo o se maneje implícitamente.

#### B. Nivel Grupo (Organizacional)

- **Módulo**: `src/group/group-role`
- **Entidad**: `GroupRole`
- **Descripción**: Este es el nivel **principal** de control de acceso operativo.
- **Funcionamiento**:
  - Un usuario pertenece a un `Group` a través de `UserGroup`.
  - En esa relación, se le asigna un `GroupRole` (ej. "Líder de Grupo", "Miembro", "Tesorero").
  - Este rol define qué puede hacer el usuario *dentro* de ese grupo específico (invitar gente, gestionar finanzas, crear semestres).

#### C. Nivel Actividad / Operativo (Semestral)

- **Módulo**: `src/position` y `src/assignment`
- **Entidad**: `Position` (Cargo)
- **Descripción**: Define el "trabajo" o "puesto" que ocupa una persona en una actividad específica.
- **Diferencia Clave**: A diferencia de los Roles de Grupo, los **Cargos (Positions)** son típicamente descriptivos y funcionales (ej. "Logística", "Staff", "Coordinador de Evento") y están vinculados a una `Assignment`. No necesariamente otorgan permisos administrativos en la plataforma, sino responsabilidades en el evento real.

---

### 2. Descripción de Módulos

#### Core

- **Auth**: Manejo de autenticación vía JWT. Registro e inicio de sesión estándar (Email/Password).
- **User**: Gestión de identidad. Almacena RUT, datos de contacto y perfil.
- **Config**: Gestión de variables de entorno y configuración de DB.

#### Organización (Group Module)

- **Group**: La unidad central. Puede representar una generación, un curso, o un equipo de voluntariado.
- **Semester**: Unidad temporal dentro de un Grupo (ej. "Semestre Otoño 2024"). Permite organizar las actividades por periodos.
- **UserGroup**: Tabla pivote que vincula usuarios a grupos y les otorga su `GroupRole`.

#### Operaciones (Activity Module)

- **Activity**: Eventos puntuales (reuniones, ferias, salidas) que ocurren dentro de un Semestre.
- **Position**: Define los cargos disponibles para las actividades.
- **Assignment**: El vínculo final operativa. Asigna a un `User` a una `Activity` específica ocupando una `Position`.

#### Finanzas (Finance Module)

- **Objetivo**: Gestión de metas económicas y ventas (probablemente para recaudación de fondos de los grupos).
- **Componentes**:
  - **Goal**: Metas financieras establecidas.
  - **Sale**: Registro de ventas realizadas.
  - **SaleColumn / SaleRow**: Estructura flexible para detallar ítems o categorías dentro de las ventas (posiblemente para planillas de control).

---

## Base de Datos (Relaciones Clave)

El esquema relacional refleja la jerarquía mencionada:

1. **Users** `1:N` **UserGroups** `N:1` **Groups**
    *Relación fundamental de pertenencia.*
2. **Groups** `1:N` **GroupRoles**
    *Los roles se definen por grupo (o se heredan de plantillas).*
3. **UserGroups** `N:1` **GroupRoles**
    *Al unirse al grupo, el usuario recibe un rol específico.*
4. **Groups** `1:N` **Semesters** `1:N` **Activities**
    *Flujo temporal: Grupo -> Semestre -> Actividad.*
5. **Activities** `1:N` **Assignments**
    *Personal asignado a la actividad.*
6. **Assignments** `N:1` **Users** y `N:1` **Positions**
    *Quién hace qué.*

## Conclusión

El backend de L-APP está diseñado para ser multi-inquilino a nivel lógico (basado en Grupos). El sistema de permisos es robusto a nivel de Grupo (`GroupRole`), permitiendo que cada organización gestione sus propios miembros y reglas. La capa operativa (`Check-in/Assignments`) permite gestionar el voluntariado o trabajo académico detallado actividad por actividad.

---
*Documentación generada automáticamente por Antigravity tras análisis del código fuente (Febrero 2026).*
