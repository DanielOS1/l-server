# Plan de Pruebas: Funcionalidades Básicas del Sistema

Este documento describe los pasos para probar el flujo completo desde el registro de usuario hasta la gestión de grupos y roles.

## 1. Registro de Usuarios

Primero, registraremos dos usuarios para poder probar la interacción entre ellos.

**Endpoint:** `POST /auth/register`

**Usuario 1 (Admin/Owner potencial):**

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "11111111-1",
  "email": "juan.perez@example.com",
  "password": "SecurePassword123",
  "occupation": "Developer",
  "address": "Calle Falsa 123",
  "birthDate": "1990-01-01"
}
```

**Usuario 2 (Miembro potencial):**

```json
{
  "firstName": "Maria",
  "lastName": "Gomez",
  "rut": "22222222-2",
  "email": "maria.gomez@example.com",
  "password": "SecurePassword123",
  "occupation": "Designer"
}
```

> **Nota:** Guarda los `id` de los usuarios retornados en la respuesta para los siguientes pasos.

---

## 2. Autenticación (Login)

Verifica que el usuario pueda iniciar sesión y obtener un rol de sistema.

**Endpoint:** `POST /auth/login`

**Payload:**

```json
{
  "email": "juan.perez@example.com",
  "password": "SecurePassword123"
}
```

> **IMPORTANTE:** Guarda el `access_token` de Juan (Owner) y Maria (Member). Los necesitarás para el Header `Authorization: Bearer <token>`.

---

## 3. Crear un Grupo

El Usuario 1 creará un nuevo grupo.

**Endpoint:** `POST /groups`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**
Reemplaza `USER_ID_JUAN` con el ID real del Usuario 1.

```json
{
  "name": "Equipo de Desarrollo",
  "description": "Grupo para el desarrollo de la app Lolos",
  "createdById": "USER_ID_JUAN"
}
```

**Validación:**

1.  Revisa la respuesta JSON.
2.  Deberías ver una sección `userGroups` donde `userId` coincide con `USER_ID_JUAN`.
3.  Verifica que `isCreator` sea `true`.
4.  **Crucial:** Verifica que dentro de `userGroups`, el objeto `groupRole` tenga `name: "OWNER"`.
5.  **Nota el ID del Grupo (groupId)**.

---

## 4. Agregar un Segundo Usuario

El Usuario 1 (Owner) agregará al Usuario 2 (Maria) al grupo.

**Endpoint:** `POST /groups/:groupId/add-member`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "userId": "USER_ID_MARIA",
  "assignedByUserId": "USER_ID_JUAN"
}
```

**Validación:**

1.  Busca la nueva entrada en `userGroups` para Maria.
2.  Verifica que su `groupRole` tenga `name: "MEMBER"`.

---

## 5. Gestión de Roles de Grupo (Prueba de Seguridad)

### 5.1 Crear Rol como Owner (Debe funcionar)

**Endpoint:** `POST /group-roles`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Líder Técnico",
  "description": "Responsable técnico del equipo",
  "groupId": "GROUP_ID"
}
```

**Esperado:** 201 Created. Retorna el nuevo rol.

### 5.2 Listar Roles como Miembro (Debe funcionar)

**Endpoint:** `GET /group-roles?groupId=GROUP_ID`
**Header:** `Authorization: Bearer <TOKEN_MARIA>`

**Esperado:** 200 OK. Lista de roles incluyendo "Líder Técnico", "OWNER" y "MEMBER".

### 5.3 Crear Rol como Miembro (Debe fallar)

**Endpoint:** `POST /group-roles`
**Header:** `Authorization: Bearer <TOKEN_MARIA>`

**Payload:**

```json
{
  "name": "Hacker Role",
  "groupId": "GROUP_ID"
}
```

**Esperado:** 403 Forbidden. "Only the group owner can manage roles".

### 5.4 Eliminar Rol como Owner (Debe funcionar)

**Endpoint:** `DELETE /group-roles/:roleId`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Esperado:** 200 OK.
