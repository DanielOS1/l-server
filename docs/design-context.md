# Narrativa de Diseño y Flujo de Usuario - Proyecto L-APP

Este documento describe el funcionamiento de la aplicación desde una perspectiva de usuario y flujo de datos, diseñado para servir como base (prompt) para el diseño de interfaces (UI/UX).

## 1. El Concepto y la Entrada
Imagina una plataforma centralizada para gestionar comunidades activas, como grupos de voluntariado, centros de estudiantes o equipos de trabajo.
El usuario ingresa a la aplicación y lo primero que encuentra es su **Portal de Grupos**. Un usuario puede pertenecer al grupo "Generación 2024" y al mismo tiempo al grupo "Voluntarios de Verano".
**Acción Clave**: El usuario selecciona el grupo con el que quiere interactuar.

## 2. El Ecosistema del Grupo (Dashboard)
Una vez dentro de un grupo, el sistema carga el contexto. Aquí es donde entra el primer nivel de roles: **Roles de Grupo**.
- Si el usuario es un **Líder/Admin**, ve paneles de configuración, finanzas y gestión de miembros.
- Si es un **Miembro**, ve sus próximas responsabilidades y anuncios.

El grupo organiza su vida en **Semestres** (periodos de tiempo). El usuario siempre ve por defecto el Semestre Activo (ej. "Otoño 2025"), pero puede navegar al historial pasado.

## 3. El Corazón Operativo: Las Actividades
El flujo principal de trabajo ocurre en el módulo de **Actividades**.
Como administrador o planificador, mi tarea es crear eventos.
**Flujo de Creación**:
1. Entro a la vista de "Planificación".
2. Creo una **Actividad**: "Seminario de Bienvenida". Defino fecha, hora y lugar.
3. *Punto Crítico*: Defino la estructura humana necesaria para esa actividad. Aquí es donde entran los **Cargos (Positions)**.
   - Para este seminario necesito: "2 Recepcionistas", "1 Sonidista" y "5 Guías".
   - Estos "Cargos" son plantillas que ya existen en el semestre o que creo al vuelo.

## 4. La Asignación (El Match)
Este es el momento donde la lógica de negocio se conecta con el usuario. Tenemos una actividad creada ("Seminario") y necesidades definidas ("Necesito un Sonidista").
El proceso de **Asignación (Assignment)** es el acto de tomar a un Usuario del grupo y colocarlo en esa posición específica para ese evento específico.

**Visualización Sugerida**:
- Una vista de "Matriz" o "Kanban" donde veo las Actividades del mes.
- Al entrar al detalle de la Actividad, veo los "Slots" o vacantes disponibles por Cargo (ej. Sonidista: 0/1 ocupado).
- **Acción**: Arrastrar a un usuario (o seleccionarlo de una lista inteligente con buscador) y asignarlo al puesto.
- **Resultado**: El sistema crea un registro `Assignment` que vincula: Usuario + Actividad + Cargo.

## 5. La Experiencia del Usuario Asignado
Finalmente, el usuario "Juan", que fue asignado como "Sonidista", recibe una notificación.
Cuando Juan entra a su Dashboard personal en la sección "Mis Compromisos", ve:
- **Actividad**: Seminario de Bienvenida.
- **Mi Rol/Cargo**: Sonidista.
- **Detalle**: Instrucciones específicas o notas que el líder le dejó al asignarlo.

---
**Resumen para Diseño Visual:**
La interfaz debe reflejar claridad jerárquica:
1.  **Nivel Macro**: Selección de Organización (Grupo).
2.  **Nivel Gestión**: Tablero de control y Finanzas (visible solo para roles altos).
3.  **Nivel Micro (Operativo)**: Calendario de Actividades -> Detalle de Actividad -> Gestión de Cupos (Positions) -> Asignación de Personas.
