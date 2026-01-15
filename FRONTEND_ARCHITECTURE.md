# Plan de Implementación Frontend (Mobile - React Native / Expo)

Este documento describe la arquitectura y los componentes principales para la aplicación móvil Lolos-App (Android/Expo).

## 1. Arquitectura General y Navegación

La navegación se basará en **React Navigation** con un enfoque nativo.

- **Stack Navigator Principal**:
  - `AuthStack`: Login, Registro (Screens sin barra de navegación).
  - `AppStack`: Flujo principal de la aplicación.
- **AppStack (Drawer o Bottom Tabs)**:
  - Uso de **Bottom Tab Navigator** para acceso rápido a módulos principales: `Inicio`, `Operaciones`, `Finanzas`, `Perfil`.
  - **Contexto Global**:
    - `AuthContext`: Token en `Expo SecureStore`.
    - `GroupContext`: Grupo activo persistido. Un "Selector de Grupo" puede estar en el Header o en un Modal inicial.

## 2. Módulos y Pantallas (Screens)

### A. Módulo de Autenticación (Auth)

- **Screens**:
  - `LoginScreen`: Inputs estilizados, botón de ingreso.
  - `RegisterScreen`: ScrollView para el formulario de registro.
- **Lógica**: Almacenamiento seguro de JWT usando `expo-secure-store`.

### B. Módulo de Grupos (Group)

- **Components**:
  - `GroupSelectorHeader`: Componente en el header de navegación que muestra el grupo actual y al tocarlo abre un `BottomSheet` o `Modal` para cambiar de grupo.
  - `CreateGroupScreen`: Pantalla modal (`presentation: 'modal'`) para crear grupos.
  - `MembersScreen`: `FlatList` optimizado. Swipeable items para acciones rápidas (eliminar/editar rol si es admin).

### C. Módulo de Operaciones (Semesters, Activities)

- **Screens**:
  - `OperationsHomeScreen`: Dashboard. Muestra el semestre actual "Card".
  - `ActivityListScreen`: Lista vertical (`FlatList`) de actividades.
  - `ActivityDetailScreen`: Detalle de la actividad. Botones grandes para acciones.
- **Components**:
  - `SemesterSelector`: Filtro horizontal o Modal Picker para cambiar semestre.
  - `AssignmentCard`: Tarjeta que muestra Usuario -> Cargo.
  - `Floating Action Button (FAB)`: Para crear nuevas actividades rápidamente.

### D. Módulo Financiero (Goals & Sales)

- **Screens**:
  - `FinanceDashboardScreen`: Gráficos circulares o barras de progreso (Meta vs Actual).
  - `GoalFormScreen`: Formulario para definir metas.
  - `SalesListScreen`: Historia de ventas.
  - `SaleDetailScreen`: Vista compleja con la planilla dinámica.

### E. Componente Crítico: Planilla Dinámica (Mobile View)

Adaptación de la hoja de cálculo a una experiencia móvil (Android).

- **Desafío**: Las tablas anchas no funcionan bien en celulares verticales.
- **Solución**: Vista de Lista de Tarjetas (`Card List View`).

1.  **`ColumnConfigurator` (Admin)**:

    - Pantalla de configuración donde el admin agrega campos.
    - Uso de `BottomSheet` para añadir una columna: Seleccionar Nombre y Tipo (Spinner/Picker).

2.  **`SaleRowList` (Visualización)**:

    - En lugar de una tabla gigante, cada "Fila" es una **Tarjeta (Card)** que resume los datos clave (ej. Nombre del producto y Monto).
    - Al tocar la tarjeta, se abre un detalle para editar todos los campos.

3.  **`AddSaleRowScreen` (Ingreso)**:

    - Formulario generado dinámicamente (`Array.map`).
    - Si la columna es `TEXT`: `TextInput`.
    - Si la columna es `NUMBER`: `TextInput` con `keyboardType='numeric'`.
    - Si la columna es `DATE`: `DateTimePicker` (nativo Android).

4.  **`LiveTotalFooter`**:
    - Barra fija en la parte inferior de la pantalla que muestra el total recaudado mientras se navega.

## Librerías Recomendadas (Expo/React Native)

- **UI**: `React Native Paper` (Material Design para Android) o `Tamagui`/`NativeBase`.
- **Navegación**: `React Navigation`.
- **Formularios**: `React Hook Form` + `Zod`.
- **Fechas**: `@react-native-community/datetimepicker`.
- **Storage**: `expo-secure-store`.
- **Gestos**: `react-native-gesture-handler` (para swipe-to-delete).

## Flujo de Trabajo Sugerido

1.  **Setup**: `npx create-expo-app`, configurar Navegación y SecureStore.
2.  **Auth & Groups**: Login y lógica de selección de grupo (Fundamental para el header).
3.  **Operaciones**: Listas simples `FlatList` para actividades.
4.  **Finanzas (Planilla)**: Implementar la vista de tarjetas y el formulario dinámico.
