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

---

## 6. Gestión de Períodos, Actividades y Cargos

### 6.1 Crear un Semestre (Período)

El Usuario 1 (Owner) creará un Semestre para el grupo.

**Endpoint:** `POST /semester`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Primer Semestre 2026",
  "startDate": "2026-03-01",
  "endDate": "2026-07-31",
  "groupId": "GROUP_ID"
}
```

**Validación:**

1.  Verifica que el `id` del semestre sea retornado.
2.  Verifica que `isActive` sea `true` por defecto.
3.  **Nota el ID del Semestre (SEMESTER_ID)**.

### 6.2 Crear Cargos para el Semestre (Position)

Definiremos un cargo disponible para este semestre (ej. "Coordinador de Evento").

**Endpoint:** `POST /position`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Coordinador de Evento",
  "description": "Encargado de la logística del evento",
  "semesterId": "SEMESTER_ID"
}
```

**Validación:**

1.  Verifica que se cree correctamente.
2.  **Nota el ID del Cargo (POSITION_ID)**.

### 6.3 Crear una Actividad

Crearemos una actividad dentro de las fechas del semestre.

**Endpoint:** `POST /activity`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Bienvenida 2026",
  "description": "Actividad de inicio de año",
  "date": "2026-03-15T10:00:00Z",
  "location": "Sede Central",
  "semesterId": "SEMESTER_ID"
}
```

**Validación:**

1.  Verifica que la actividad se cree.
2.  **Prueba de fallo (Opcional):** Intenta crear una actividad con fecha `2026-01-01` (fuera de rango). Debería fallar con `400 Bad Request`.
3.  **Nota el ID de la Actividad (ACTIVITY_ID)**.

### 6.4 Asignar un Usuario a un Cargo en la Actividad

Asignaremos a Maria (Usuario 2) como Coordinadora para la Actividad "Bienvenida 2026".

**Endpoint:** `POST /assignment`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "activityId": "ACTIVITY_ID",
  "positionId": "POSITION_ID",
  "userId": "USER_ID_MARIA",
  "notes": "Asignada por experiencia previa"
}
```

**Validación:**

1.  Verifica que la asignación se guarde.
2.  Puedes verificar listando las asignaciones de la actividad: `GET /assignment?activityId=ACTIVITY_ID`.

---

## 7. Gestión Financiera (Metas y Ventas)

### 7.1 Crear una Meta de Grupo (Goal)

El Owner definirá una meta financiera para el grupo.

**Endpoint:** `POST /goal`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Recaudación Anual 2026",
  "description": "Meta para financiar el viaje de fin de año",
  "targetAmount": 5000000,
  "startDate": "2026-03-01",
  "groupId": "GROUP_ID",
  "isActive": true
}
```

**Validación:**

1.  Verifica que se retorne la meta con `id`.
2.  **Nota el ID de la Meta (GOAL_ID)**.

### 7.2 Verificar Unicidad de Meta Activa (Prueba de Fallo)

Intentar crear otra meta activa para el mismo grupo.

**Endpoint:** `POST /goal`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Meta Duplicada",
  "targetAmount": 1000,
  "startDate": "2026-03-01",
  "groupId": "GROUP_ID",
  "isActive": true
}
```

**Esperado:** `400 Bad Request`.

### 7.3 Crear una Venta (Sale)

Crearemos un evento de venta asociado a la meta.

**Endpoint:** `POST /sale`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "name": "Venta de Completos",
  "description": "Venta en el patio de la universidad",
  "date": "2026-04-10T12:00:00Z",
  "location": "Patio Central",
  "goalId": "GOAL_ID"
}
```

**Validación:**

1.  Verifica que se cree la venta.
2.  **Nota el ID de la Venta (SALE_ID)**.

### 7.4 Listar Ventas de una Meta

**Endpoint:** `GET /sale?goalId=GOAL_ID`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Validación:**

1.  Debe retornar un array con la venta creada.

### 7.5 Configurar Columnas de la Planilla

Definiremos dos columnas: "Producto" (Texto) y "Monto" (Número, Funcional).

**Endpoint:** `POST /sale-column`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Paso 1: Columna Producto**

```json
{
  "name": "Producto",
  "type": "TEXT",
  "saleId": "SALE_ID",
  "orderIndex": 1
}
```

_Nota el ID de la Columna Producto (COL_PROD_ID)_.

**Paso 2: Columna Monto**

```json
{
  "name": "Monto",
  "type": "NUMBER",
  "saleId": "SALE_ID",
  "isFunctionalAmount": true,
  "orderIndex": 2
}
```

_Nota el ID de la Columna Monto (COL_MONTO_ID)_.

### 7.6 Agregar un Registro (Fila) a la Venta

Agregaremos una venta de "Completo" por "2000".

**Endpoint:** `POST /sale-row`
**Header:** `Authorization: Bearer <TOKEN_JUAN>`

**Payload:**

```json
{
  "saleId": "SALE_ID",
  "addedByUserId": "USER_ID_JUAN",
  "values": [
    { "columnId": "COL_PROD_ID", "value": "Completo" },
    { "columnId": "COL_MONTO_ID", "value": "2000" }
  ]
}
```

**Validación:**

1.  Verifica que se cree la fila.
2.  Verifica la Venta (`GET /sale/SALE_ID`). El campo `totalAmount` debería ser ahora `2000`.

### 7.7 Agregar otro Registro y Verificar Suma

Agregaremos otro "Bebida" por "1000".

**Payload:** Enviar nuevamente a `POST /sale-row` con valores "Bebida" y "1000".

**Validación:**

1.  Verifica la Venta de nuevo. `totalAmount` debería ser `3000`.
