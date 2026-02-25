# 📋 Informe de Integración — Gestión de Tareas

Compañeros, subí los siguientes archivos a la rama. Para que todo funcione deben hacer cambios puntuales en sus archivos. A continuación están los cambios **exactos** que cada uno debe aplicar.

---

## 📁 Archivos que subí (no tocar)

| Archivo | Qué hace |
|---|---|
| `use-case/tareas/getTareas.js` | Obtiene las tareas de un usuario desde el servidor |
| `use-case/tareas/postTareas.js` | Envía una nueva tarea al servidor (POST) |
| `components/tareas.js` | Crea una card HTML dinámicamente con los datos de una tarea |

---

## 👤 Compañero 1 — Encargado de `script.js`

### 1. Agrega los imports al inicio del archivo

Al principio de `script.js`, en la sección de **Importaciones**, agrega estas 3 líneas:

```js
import { crearCardTarea } from './components/tareas.js';
import { getTareas } from './use-case/tareas/getTareas.js';
import { postTarea } from './use-case/tareas/postTareas.js';
```

### 2. Cambia la variable `taskTableBody` por `tasksContainer`

Busca esta línea:
```js
const taskTableBody = document.getElementById('taskTableBody');
```
Reemplázala por:
```js
const tasksContainer = document.getElementById('tasksContainer');
```

### 3. Reemplaza la función `createMessageElement`

Elimina la función actual y ponla así:

```js
function createMessageElement(tarea) {
    const card = crearCardTarea(tarea);
    tasksContainer.insertBefore(card, emptyTasksState);
    totalTasks++;
    updateMessageCount();
    hideEmptyState();
}
```

### 4. Agrega estas dos funciones nuevas (después de `updateMessageCount`)

```js
function limpiarTareas() {
    const cards = tasksContainer.querySelectorAll('.task-card');
    cards.forEach(card => card.remove());
    totalTasks = 0;
    updateMessageCount();
    showEmptyState();
}

async function renderTareasUsuario(userId) {
    const tareas = await getTareas(userId);
    if (tareas.length === 0) {
        showEmptyState();
        return;
    }
    tareas.forEach(tarea => {
        const card = crearCardTarea(tarea);
        tasksContainer.insertBefore(card, emptyTasksState);
        totalTasks++;
    });
    updateMessageCount();
    hideEmptyState();
}
```

### 5. En `handleSearchSubmit`, después de mostrar la info del usuario, agrega:

```js
limpiarTareas();
await renderTareasUsuario(docValue.trim());
```

Debe quedar justo antes del `console.log('usuario cargado correctamente')`.

### 6. En `handleFormSubmit`, reemplaza el bloque `try/catch` del fetch POST por:

```js
const tareaCreada = await postTarea(newTask);

if (tareaCreada) {
    createMessageElement(tareaCreada);
    taskForm.reset();
    taskTitleInput.focus();
}
```

> **⚠️ Importante:** El objeto `newTask` usa `userId: currentUser.id` — esto debe quedar igual.

---

## 👤 Compañero 2 — Encargado de `index.html` y `styles.css`

### Cambios en `index.html`

#### 1. Reemplaza la tabla de tareas por un contenedor div

Busca y elimina todo esto:
```html
<div class="card" style="overflow-x: auto;">
  <table class="task-table">
    <thead>
      <tr>
        <th>Título</th>
        <th>Descripción</th>
        <th>Importancia</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody id="taskTableBody">
    </tbody>
  </table>
  <div class="messages-empty" id="emptyTasks">
    <p class="messages-empty__text">No hay tareas registradas para este usuario</p>
  </div>
</div>
```

Y ponlo así:
```html
<div id="tasksContainer" class="tasks-container">
  <div class="messages-empty" id="emptyTasks">
    <p class="messages-empty__text">No hay tareas registradas para este usuario</p>
  </div>
</div>
```

#### 2. Cambia el tag `<script>` al final del body

Busca:
```html
<script src="script.js"></script>
```
Cámbialo por:
```html
<script type="module" src="script.js"></script>
```

> **⚠️ CRÍTICO:** Sin `type="module"` los `import` no funcionan y la página quedará rota.

---

### Cambios en `styles.css`

#### Agrega al final del archivo estos estilos nuevos:

```css
/* Contenedor de cards de tareas */
.tasks-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Card de tarea — reutiliza .card, solo agrega borde y animación */
.task-card {
    border-left: 4px solid var(--color-primary);
    animation: slideIn var(--transition-slow) ease-out;
}

/* Filas dentro de la card */
.task-card__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px dashed var(--color-gray-200);
}

.task-card__row:last-child {
    border-bottom: none;
}

.task-card__label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
}

.task-card__value {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    text-align: right;
    max-width: 60%;
    word-break: break-word;
}
```

---

## ✅ Verificación final

Después de aplicar todos los cambios, al buscar un usuario deben ocurrir estas cosas:

1. ✅ Aparece el nombre y correo del usuario
2. ✅ Si el usuario tiene tareas registradas → aparecen como cards debajo
3. ✅ Si no tiene tareas → aparece el mensaje "No hay tareas registradas"
4. ✅ Al agregar una nueva tarea → aparece una card nueva sin refrescar la página
5. ✅ Al buscar otro usuario → las cards anteriores desaparecen y cargan las del nuevo
    