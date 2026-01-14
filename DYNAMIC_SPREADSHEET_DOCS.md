# Documentación Técnica: Planilla Dinámica de Ventas

Esta funcionalidad permite que cada Venta (`Sale`) tenga una estructura de datos flexible y configurable, similar a una hoja de cálculo, pero manteniendo la estructura relacional en la base de datos (PostgreSQL).

## Arquitectura (Modelo EAV Normalizado)

En lugar de usar columnas JSONB no estructuradas o bases de datos NoSQL, optamos por un modelo **Entidad-Atributo-Valor (EAV)** normalizado. Esto garantiza integridad referencial, tipado fuerte y facilidad para reportes SQL.

### Entidades

1.  **`SaleColumn` (Las Columnas)**
    v - Definen _qué_ datos se van a guardar. - Campos clave: - `name`: Título de la columna (ej. "Monto", "Item", "Responsable"). - `type`: Tipo de dato (`TEXT`, `NUMBER`, `DATE`). - `isFunctionalAmount`: **Crucial**. Si es `true`, los valores de esta columna se suman automáticamente al `totalAmount` de la Venta.

2.  **`SaleRow` (Las Filas)**

    - Agrupan un conjunto de valores (Celdas) creados en un mismo momento.
    - Contiene metadatos de auditoría (`addedByUserId`, `createdAt`).

3.  **`SaleValue` (Las Celdas)**
    - Almacena el dato real.
    - Relaciona una `SaleRow` con una `SaleColumn`.
    - `value`: Se guarda siempre como `string` en base de datos.
    - **Validación**: Antes de guardar, el servicio (`SaleRowService`) valida que el string cumpla con el `type` de la columna (ej. que sea numérico si la columna es `NUMBER`).

### Flujo de Datos

#### 1. Definición de la Estructura

El usuario (Owner/Tesorero) define las columnas para una venta.
`POST /sale-column`

```json
{
  "saleId": "...",
  "name": "Monto Recaudado",
  "type": "NUMBER",
  "isFunctionalAmount": true
}
```

#### 2. Ingreso de Datos (Filas)

Los miembros ingresan registros.
`POST /sale-row`

```json
{
  "saleId": "...",
  "addedByUserId": "...",
  "values": [
    { "columnId": "COL_MONTO_ID", "value": "5000" },
    { "columnId": "COL_ITEM_ID", "value": "Completo Italiano" }
  ]
}
```

#### 3. Procesamiento y Cálculos

Al recibir el `POST /sale-row`:

1.  **Validación**: Se verifica que cada valor corresponda al tipo de dato de su columna.
2.  **Persistencia**: Se guardan la `SaleRow` y sus `SaleValue`s dentro de una **transacción**.
3.  **Cálculo Automático**: El sistema detecta si alguna de las columnas afectadas tiene `isFunctionalAmount = true`. Si es así, convierte el valor a número y actualiza el campo `totalAmount` de la entidad `Sale`.

### Ventajas de este Enfoque

- **Integridad**: Si se borra una columna, se pueden borrar en cascada sus valores (o impedirlo).
- **Performance**: El total de la venta (`totalAmount`) está pre-calculado en la entidad `Sale`, evitando tener que sumar miles de filas cada vez que se consulta la lista de ventas.
- **Flexibilidad**: Cada venta puede tener campos totalmente distintos sin alterar el esquema de la base de datos.
