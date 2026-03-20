# Guía de Migración — Frontend v3.0.0 → v3.3.0

> **Proyecto:** Gestión de Tareas SENA — Tecnología en ADSI (2994281)  
> **Equipo:** Julián Diaz · Luis Villamizar · Carol Lizarazo · Josué Chaparro

---

## Antes de empezar

Asegúrate de estar en tu fork y de crear la rama de trabajo:

```bash
git checkout -b feature/panel-admin
npm install json-server concurrently --save-dev
```

---

## Mapa de versiones

| Versión | Qué incluye |
|---------|-------------|
| `3.0.0` | Estado inicial del equipo |
| `3.1.0` | Nuevas APIs, campo `userIds[]`, panel admin completo |
| `3.2.0` | Reglas de negocio: completadas bloqueadas, IDs secuenciales, bug duplicación |
| `3.3.0` | Validación de formularios con UI |

---

---

# PARTE 1 — Preparar el entorno de datos

---

## Paso 1 — `package.json` · Agregar scripts

Reemplazar el bloque `"scripts"` actual:

```json
// ANTES
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

```json
// DESPUÉS
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "server": "json-server --watch db.json --port 3001",
  "start": "concurrently \"npm run server\" \"npm run dev\""
}
```

---

## Paso 2 — `db.json` · Crear en la raíz del proyecto

Crear el archivo `db.json` en la misma carpeta que `package.json`. Este archivo es la base de datos local que consume json-server.

> **Importante:** El campo que antes era `userId` (string con un solo ID) ahora es `userIds` (array de strings). Esto permite asignar una tarea a varios usuarios al mismo tiempo.

```json
{
  "users": [
    { "id": "10103", "nombre_completo": "Carlos Ruiz",     "correo": "carlos.ruiz@email.com",  "activo": true  },
    { "id": "10104", "nombre_completo": "Lucía Fernández", "correo": "lucia.fdez@email.com",   "activo": true  },
    { "id": "10105", "nombre_completo": "Marcos Paez",     "correo": "marcos.paez@email.com",  "activo": true  },
    { "id": "10106", "nombre_completo": "Sofía Castro",    "correo": "sofia.castro@email.com", "activo": true  },
    { "id": "10107", "nombre_completo": "Diego Mora",      "correo": "diego.mora@email.com",   "activo": false }
  ],
  "tasks": [
    {
      "id": "1",
      "userIds": ["10103", "10104"],
      "titulo": "Diseñar mockups",
      "descripcion": "Crear los wireframes del módulo de usuarios",
      "prioridad": "Alta",
      "estado": "En Progreso",
      "fecha_registro": "11 de marzo de 2026, 09:00"
    },
    {
      "id": "2",
      "userIds": ["10105"],
      "titulo": "Configurar base de datos",
      "descripcion": "Instalar y configurar PostgreSQL en el servidor",
      "prioridad": "Alta",
      "estado": "Pendiente",
      "fecha_registro": "11 de marzo de 2026, 10:30"
    }
  ]
}
```

---

> ### 💾 COMMIT
> ```bash
> git add package.json db.json
> git commit -m "chore: agregar db.json y scripts json-server + concurrently"
> ```

---

---

# PARTE 2 — Nuevas APIs

---

## Paso 3 — `src/api/tareas/getTareas.js` · Actualizar filtro y agregar función nueva

El archivo original filtraba por `userId` (string). Reemplazar **todo el contenido**:

```js
// ANTES — filtraba por userId (string, un solo usuario)
const tareas = todasLasTareas.filter(tarea => tarea.userId === userId);
```

```js
// DESPUÉS — contenido completo del archivo
export async function getTareas(api_url, userId) {
    try {
        const response = await fetch(`${api_url}/tasks`);
        if (!response.ok) throw new Error("Error al conectar con el servidor de tareas");
        const todasLasTareas = await response.json();

        // Soporta userIds[] (nuevo) y userId string (retrocompatibilidad)
        const tareas = todasLasTareas.filter(tarea => {
            if (Array.isArray(tarea.userIds)) {
                return tarea.userIds.includes(String(userId));
            }
            return String(tarea.userId) === String(userId);
        });

        return tareas;
    } catch (error) {
        console.error("Error en getTareas:", error);
        return [];
    }
}

// NUEVA — trae todas las tareas sin filtro (para el panel admin)
export async function getTodasLasTareas(api_url) {
    try {
        const response = await fetch(`${api_url}/tasks`);
        if (!response.ok) throw new Error("Error al obtener todas las tareas");
        return await response.json();
    } catch (error) {
        console.error("Error en getTodasLasTareas:", error);
        return [];
    }
}
```

---

## Paso 4 — `src/api/tareas/updateTarea.js` · Agregar `actualizarEstadoTarea`

El archivo original solo tenía `editarTarea`. Agregar al **final del archivo** sin tocar lo existente:

```js
// AGREGAR al final — permite cambiar solo el estado con PATCH
export const actualizarEstadoTarea = async (api_url, id, estado) => {
    try {
        const res = await fetch(`${api_url}/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        return res.ok;
    } catch {
        return false;
    }
};
```

---

## Paso 5 — `src/api/usuarios/usuariosApi.js` · Crear archivo nuevo

El original tenía `getUsuario.js` sin implementación. Crear el archivo `usuariosApi.js` en la misma carpeta:

```js
export const getUsuario = async (api_url, id) => {
    const res = await fetch(`${api_url}/users/${id}`);
    if (!res.ok) throw new Error('Usuario no encontrado');
    return res.json();
};

export const getUsuarios = async (api_url) => {
    const res = await fetch(`${api_url}/users`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
};

export const crearUsuario = async (api_url, datos) => {
    // Calcula el siguiente ID numérico secuencial para evitar IDs aleatorios
    const todos = await getUsuarios(api_url);
    const idsNumericos = todos
        .map(u => parseInt(u.id, 10))
        .filter(n => !isNaN(n));
    const siguienteId = idsNumericos.length > 0
        ? String(Math.max(...idsNumericos) + 1)
        : '1';

    const res = await fetch(`${api_url}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siguienteId, ...datos, activo: true })
    });
    if (!res.ok) throw new Error('Error al crear usuario');
    return res.json();
};

export const editarUsuario = async (api_url, id, datos) => {
    const res = await fetch(`${api_url}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    return res.json();
};

export const eliminarUsuario = async (api_url, id) => {
    const res = await fetch(`${api_url}/users/${id}`, { method: 'DELETE' });
    return res.ok;
};

export const toggleActivoUsuario = async (api_url, id, activo) => {
    const res = await fetch(`${api_url}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo })
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    return res.json();
};
```

---

> ### 💾 COMMIT
> ```bash
> git add src/api/
> git commit -m "feat: getTareas con userIds[], actualizarEstadoTarea y usuariosApi completo"
> ```

---

---

# PARTE 3 — Componentes UI

---

## Paso 6 — `src/ui/tareas.js` · Reemplazar completamente

El archivo original exportaba solo `crearCardTarea` con botones Editar/Eliminar. El nuevo exporta dos versiones de card y bloquea la edición de tareas completadas. Reemplazar **todo el contenido**:

```js
// AUXILIARES — misma técnica del equipo: sin innerHTML
const crearFila = (label, value) => {
    const div = document.createElement('div');
    div.classList.add('task-card__row');
    const spanLabel = document.createElement('span');
    spanLabel.classList.add('task-card__label');
    spanLabel.textContent = `${label}:`;
    const spanValue = document.createElement('span');
    spanValue.classList.add('task-card__value');
    spanValue.textContent = value || 'N/A';
    div.appendChild(spanLabel);
    div.appendChild(spanValue);
    return div;
};

const crearFilaConElemento = (label, elemento) => {
    const div = document.createElement('div');
    div.classList.add('task-card__row');
    const spanLabel = document.createElement('span');
    spanLabel.classList.add('task-card__label');
    spanLabel.textContent = `${label}:`;
    const valSpan = document.createElement('span');
    valSpan.classList.add('task-card__value');
    valSpan.appendChild(elemento);
    div.appendChild(spanLabel);
    div.appendChild(valSpan);
    return div;
};

const crearBadgePrioridad = (prioridad) => {
    const badge = document.createElement('span');
    badge.classList.add('priority-tag', (prioridad || 'baja').toLowerCase());
    badge.textContent = (prioridad || 'BAJA').toUpperCase();
    return badge;
};

const crearChipsUsuarios = (userIds, usuarios) => {
    const contenedor = document.createElement('span');
    contenedor.classList.add('task-card__value', 'task-card__chips');
    const ids = userIds || [];
    if (ids.length === 0) {
        const chip = document.createElement('span');
        chip.classList.add('chip', 'chip--muted');
        chip.textContent = 'Sin asignar';
        contenedor.appendChild(chip);
        return contenedor;
    }
    ids.forEach(uid => {
        const u = usuarios.find(u => String(u.id) === String(uid));
        const chip = document.createElement('span');
        chip.classList.add('chip');
        chip.textContent = u ? u.nombre_completo : `ID: ${uid}`;
        contenedor.appendChild(chip);
    });
    return contenedor;
};

// CARD PANEL USUARIO — solo puede cambiar el estado
// Si la tarea está Completada muestra un badge en lugar del select
export const crearCardTarea = (tarea, usuarios = []) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));
    card.appendChild(crearFila('Fecha Registro', tarea.fecha_registro));
    card.appendChild(crearFilaConElemento('Importancia', crearBadgePrioridad(tarea.prioridad)));
    card.appendChild(crearFila('Estado', tarea.estado));

    if (usuarios.length > 0) {
        const chips = crearChipsUsuarios(tarea.userIds, usuarios);
        const fila = document.createElement('div');
        fila.classList.add('task-card__row');
        const lbl = document.createElement('span');
        lbl.classList.add('task-card__label');
        lbl.textContent = 'Asignados:';
        fila.appendChild(lbl);
        fila.appendChild(chips);
        card.appendChild(fila);
    }

    const acciones = document.createElement('div');
    acciones.classList.add('task-card__actions');
    acciones.style.cssText = 'display:flex;gap:10px;margin-top:12px;align-items:center;';

    if (tarea.estado === 'Completada') {
        // Tarea bloqueada — no se puede cambiar el estado
        const badge = document.createElement('span');
        badge.classList.add('priority-tag', 'baja');
        badge.style.cssText = 'font-size:.82rem;padding:.3rem .75rem;';
        badge.textContent = '✅ Tarea completada';
        acciones.appendChild(badge);
    } else {
        const lblSelect = document.createElement('span');
        lblSelect.classList.add('task-card__label');
        lblSelect.textContent = 'Cambiar estado:';
        const selectEstado = document.createElement('select');
        selectEstado.classList.add('form__input', 'form__input--sm', 'select-estado');
        selectEstado.dataset.id = tarea.id;
        ['Pendiente', 'En Progreso', 'Completada'].forEach(op => {
            const opt = document.createElement('option');
            opt.value = op;
            opt.textContent = op;
            if (op === tarea.estado) opt.selected = true;
            selectEstado.appendChild(opt);
        });
        acciones.appendChild(lblSelect);
        acciones.appendChild(selectEstado);
    }

    card.appendChild(acciones);
    return card;
};

// CARD PANEL ADMIN — editar y eliminar
// Si la tarea está Completada el botón Editar se reemplaza por un badge
export const crearCardTareaAdmin = (tarea, usuarios = []) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));
    card.appendChild(crearFila('Fecha Registro', tarea.fecha_registro));
    card.appendChild(crearFilaConElemento('Importancia', crearBadgePrioridad(tarea.prioridad)));
    card.appendChild(crearFila('Estado', tarea.estado));

    const chips = crearChipsUsuarios(tarea.userIds, usuarios);
    const fila = document.createElement('div');
    fila.classList.add('task-card__row');
    const lbl = document.createElement('span');
    lbl.classList.add('task-card__label');
    lbl.textContent = 'Asignados:';
    fila.appendChild(lbl);
    fila.appendChild(chips);
    card.appendChild(fila);

    const acciones = document.createElement('div');
    acciones.classList.add('task-card__actions');
    acciones.style.cssText = 'display:flex;gap:10px;margin-top:15px;align-items:center;';

    if (tarea.estado === 'Completada') {
        const badge = document.createElement('span');
        badge.classList.add('priority-tag', 'baja');
        badge.style.cssText = 'font-size:.82rem;padding:.3rem .75rem;';
        badge.textContent = '✅ Tarea completada';
        acciones.appendChild(badge);
    } else {
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn--secondary', 'btn-editar-admin');
        btnEditar.dataset.id = tarea.id;
        btnEditar.textContent = 'Editar';
        acciones.appendChild(btnEditar);
    }

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn', 'btn--danger', 'btn-eliminar-admin');
    btnEliminar.dataset.id = tarea.id;
    btnEliminar.textContent = 'Eliminar';

    acciones.appendChild(btnEliminar);
    card.appendChild(acciones);
    return card;
};
```

---

## Paso 7 — `src/ui/usuarios.js` · Crear archivo nuevo

No existía en el original. Crear el archivo completo:

```js
// Card de usuario para el panel de administración
// Misma técnica DOM pura del equipo: sin innerHTML
export const crearCardUsuario = (usuario) => {
    const card = document.createElement('div');
    card.classList.add('card', 'user-card');
    card.dataset.id = usuario.id;

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('user-card__info');

    const detalles = document.createElement('div');
    detalles.classList.add('user-card__detalles');

    const nombre = document.createElement('p');
    nombre.classList.add('user-card__nombre');
    nombre.textContent = usuario.nombre_completo;

    const correo = document.createElement('p');
    correo.classList.add('user-card__correo');
    correo.textContent = usuario.correo;

    const idEl = document.createElement('p');
    idEl.classList.add('user-card__id');
    idEl.textContent = `ID: ${usuario.id}`;

    detalles.appendChild(nombre);
    detalles.appendChild(correo);
    detalles.appendChild(idEl);
    infoDiv.appendChild(detalles);

    const acciones = document.createElement('div');
    acciones.classList.add('user-card__acciones');

    const btnEditar = document.createElement('button');
    btnEditar.classList.add('btn', 'btn--secondary', 'btn--sm', 'btn-editar-user');
    btnEditar.dataset.id = usuario.id;
    btnEditar.textContent = 'Editar';

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn', 'btn--danger', 'btn--sm', 'btn-eliminar-user');
    btnEliminar.dataset.id = usuario.id;
    btnEliminar.textContent = 'Eliminar';

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);
    card.appendChild(infoDiv);
    card.appendChild(acciones);
    return card;
};
```

---

> ### 💾 COMMIT
> ```bash
> git add src/ui/
> git commit -m "feat: crearCardTarea con selector de estado, crearCardTareaAdmin y crearCardUsuario"
> ```

---

---

# PARTE 4 — Estilos

---

## Paso 8 — `src/styles.css` · Agregar estilos al final

No se toca nada de lo existente. Pegar el siguiente bloque **al final** del archivo:

```css
/* ============================================================
   EXTENSIONES v3.1.0 — Panel Admin, Tabs, Chips, User Cards
   ============================================================ */

.header__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
.header__top > div { text-align: left; }

.btn--admin {
    background-color: #7c3aed;
    color: white;
    box-shadow: var(--shadow-md);
    padding: .55rem 1rem;
    font-size: .9rem;
}
.btn--admin:hover { background-color: #6d28d9; transform: translateY(-1px); }

.admin-badge {
    display: inline-block;
    background: #ede9fe;
    color: #7c3aed;
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    padding: .2rem .7rem;
    border-radius: 9999px;
    margin-bottom: .5rem;
}

.btn--warning { background-color: var(--color-warning); color: white; box-shadow: var(--shadow-sm); }
.btn--warning:hover { opacity: .88; }

.tabs {
    display: flex;
    gap: .5rem;
    background: var(--color-surface);
    border-bottom: 2px solid var(--color-gray-200);
    padding: .5rem 0 0;
    margin-bottom: 0;
}
.tab-btn {
    padding: .55rem 1.1rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: .9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-base);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    margin-bottom: -2px;
}
.tab-btn:hover  { color: var(--color-text-primary); background: var(--color-gray-100); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 700; }

.tab-content { display: none; }
.tab-content.active { display: block; }

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    background: var(--color-background-secondary);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: .75rem;
    min-height: 48px;
}
.checkbox-label {
    display: flex;
    align-items: center;
    gap: .4rem;
    font-size: .875rem;
    cursor: pointer;
    padding: .2rem .5rem;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
}
.checkbox-label:hover { background: var(--color-gray-200); }
.checkbox-label input { accent-color: var(--color-primary); }

.task-card__chips { display: flex; flex-wrap: wrap; gap: .35rem; }
.chip {
    display: inline-block;
    padding: .18rem .55rem;
    background: var(--color-gray-100);
    border: 1px solid var(--color-gray-200);
    border-radius: 9999px;
    font-size: .78rem;
    color: var(--color-text-secondary);
}
.chip--muted { font-style: italic; }

.user-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: .75rem;
}
.user-card__info     { display: flex; align-items: center; gap: .9rem; flex: 1; }
.user-card__nombre   { font-weight: 700; font-size: .95rem; }
.user-card__correo   { font-size: .85rem; color: var(--color-text-secondary); }
.user-card__id       { font-size: .76rem; color: var(--color-text-tertiary); }
.user-card__acciones { display: flex; gap: .5rem; flex-wrap: wrap; }

.select-estado {
    padding: .3rem .6rem !important;
    font-size: .82rem !important;
    min-width: 140px;
}
```

---

> ### 💾 COMMIT
> ```bash
> git add src/styles.css
> git commit -m "style: estilos para panel admin, tabs, chips y user cards"
> ```

---

---

# PARTE 5 — HTML

---

## Paso 9 — `index.html` · Reemplazar completamente

El HTML original tiene un solo contenedor. El nuevo tiene dos paneles: usuario (visible por defecto) y admin (oculto por defecto con `class="hidden"`). Reemplazar **todo el contenido**:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestión de Tareas - SENA</title>
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>

  <!-- PANEL USUARIO -->
  <div id="panelUsuario" class="container">
    <header class="header">
      <div class="header__top">
        <div>
          <h1 class="header__title">Gestión de Tareas</h1>
          <p class="header__subtitle">Consulta de usuarios y asignación dinámica de actividades</p>
        </div>
        <button id="btnAbrirAdmin" class="btn btn--admin">
          <span class="btn__text">Panel Admin</span>
          <span class="btn__icon">🛡️</span>
        </button>
      </div>
    </header>

    <!-- Buscar usuario -->
    <section class="form-section">
      <div class="card">
        <h2 class="card__title">1. Identificación del Usuario</h2>
        <form id="searchForm" class="form">
          <div class="form__group">
            <label for="userDoc" class="form__label">Documento del Usuario</label>
            <input type="text" id="userDoc" name="userDoc" class="form__input" placeholder="Ej: 10103">
            <span class="form__error" id="searchError"></span>
          </div>
          <button type="submit" class="btn btn--primary" id="searchBtn">
            <span class="btn__text">Buscar Usuario</span>
            <span class="btn__icon">🔍</span>
          </button>
        </form>
        <div id="userInfo" class="user-info hidden">
          <div class="user-info__content">
            <p><strong>Nombre:</strong> <span id="infoNombre"></span></p>
            <p><strong>Correo:</strong> <span id="infoCorreo"></span></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtros -->
    <section class="form-section">
      <div class="card">
        <h2 class="card__title">🔍 Filtrar Tareas</h2>
        <div class="filtros-toolbar">
          <div id="filtrosContainer" class="filtros__bloque">
            <p class="filtros__placeholder">Busca un usuario para activar los filtros.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Ordenamiento -->
    <section class="form-section">
      <div class="card">
        <h2 class="card__title">↕️ Ordenar Tareas</h2>
        <div class="filtros-toolbar">
          <div id="ordenContainer" class="filtros__bloque">
            <p class="filtros__placeholder">Busca un usuario para activar el ordenamiento.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Exportar -->
    <section class="form-section">
      <div class="card">
        <h2 class="card__title">⬇️ Exportar Tareas</h2>
        <div class="filtros-toolbar">
          <div class="filtros__bloque">
            <p class="form__label">Exportar tareas visibles en pantalla como archivo JSON</p>
            <button id="btnExportar" class="btn btn--secondary">
              <span class="btn__text">Exportar JSON</span>
              <span class="btn__icon">⬇️</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Lista de tareas -->
    <section class="messages-section">
      <div class="messages-header">
        <h2 class="messages-header__title">Tareas del Usuario</h2>
        <span class="messages-header__count" id="taskCount">0 tareas</span>
      </div>
      <div id="tasksContainer" class="tasks-container">
        <div class="messages-empty" id="emptyTasks">
          <p class="messages-empty__text">No hay tareas registradas para este usuario</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p class="footer__text">Proyecto Integrador | Gestión de Tareas v3.1.0</p>
    </footer>
  </div>

  <!-- PANEL ADMINISTRADOR -->
  <div id="panelAdmin" class="hidden">
    <div class="container">
      <header class="header">
        <div class="header__top">
          <div>
            <span class="admin-badge">🛡️ Panel de Administración</span>
            <h1 class="header__title">Gestión de Tareas</h1>
          </div>
          <button id="btnCerrarAdmin" class="btn btn--secondary">
            <span class="btn__text">← Volver</span>
          </button>
        </div>
      </header>

      <nav class="tabs">
        <button class="tab-btn active" data-tab="tab-admin-tareas">📋 Tareas</button>
        <button class="tab-btn" data-tab="tab-admin-usuarios">👥 Usuarios</button>
      </nav>

      <!-- TAB: Tareas -->
      <div id="tab-admin-tareas" class="tab-content active">
        <section class="form-section" id="adminTaskFormCard" style="margin-top:1.5rem">
          <div class="card">
            <h2 class="card__title" id="adminTaskFormTitle">➕ Nueva Tarea</h2>
            <form id="adminTaskForm" class="form">
              <div class="form__group">
                <label class="form__label">Título *</label>
                <input type="text" id="adminTaskTitulo" name="adminTaskTitulo" class="form__input" placeholder="¿Qué hay que hacer?">
                <span class="form__error" id="errorAdminTaskTitulo"></span>
              </div>
              <div class="form__group">
                <label class="form__label">Descripción *</label>
                <textarea id="adminTaskDesc" name="adminTaskDesc" class="form__input form__textarea" rows="2"></textarea>
                <span class="form__error" id="errorAdminTaskDesc"></span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div class="form__group">
                  <label class="form__label">Estado</label>
                  <select id="adminTaskEstado" class="form__input">
                    <option>Pendiente</option>
                    <option>En Progreso</option>
                    <option>Completada</option>
                  </select>
                </div>
                <div class="form__group">
                  <label class="form__label">Prioridad</label>
                  <select id="adminTaskPrioridad" class="form__input">
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>
              <div class="form__group">
                <label class="form__label">Asignar usuarios *</label>
                <div id="checkboxAdminUsuarios" class="checkbox-group">
                  <p class="filtros__placeholder" style="font-size:.85rem">Cargando...</p>
                </div>
              </div>
              <div style="display:flex;gap:.75rem">
                <button type="submit" class="btn btn--primary">
                  <span id="adminTaskBtnLabel">Crear Tarea</span>
                </button>
                <button type="button" id="btnCancelarAdminTask" class="btn btn--secondary hidden">Cancelar</button>
              </div>
            </form>
          </div>
        </section>

        <section class="form-section">
          <div class="card">
            <div class="filtros-toolbar">
              <div class="filtros__grupo">
                <label class="form__label">Estado</label>
                <select id="filtroAdminEstado" class="form__input form__input--sm">
                  <option value="">Todos</option>
                  <option>Pendiente</option>
                  <option>En Progreso</option>
                  <option>Completada</option>
                </select>
              </div>
              <div class="filtros__grupo">
                <label class="form__label">Prioridad</label>
                <select id="filtroAdminPrioridad" class="form__input form__input--sm">
                  <option value="">Todas</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
              <div class="filtros__grupo">
                <label class="form__label">ID Usuario</label>
                <input type="text" id="filtroAdminUser" class="form__input form__input--sm" placeholder="Ej: 10103">
              </div>
              <button id="btnFiltrarAdmin" class="btn btn--primary btn--sm" style="align-self:flex-end">Filtrar</button>
              <button id="btnLimpiarAdmin" class="btn btn--secondary btn--sm" style="align-self:flex-end">Limpiar</button>
            </div>
          </div>
        </section>

        <div class="messages-header">
          <h2 class="messages-header__title">Todas las Tareas</h2>
          <span class="messages-header__count" id="adminTaskCount">0</span>
        </div>
        <div id="adminTasksList" class="tasks-container"></div>
      </div>

      <!-- TAB: Usuarios -->
      <div id="tab-admin-usuarios" class="tab-content">
        <section class="form-section" style="margin-top:1.5rem">
          <div class="card">
            <h2 class="card__title" id="userAdminFormTitle">➕ Nuevo Usuario</h2>
            <form id="userAdminForm" class="form">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div class="form__group">
                  <label class="form__label">Nombre completo *</label>
                  <input type="text" id="adminUserNombre" name="adminUserNombre" class="form__input" placeholder="Nombre Apellido">
                  <span class="form__error" id="errorAdminUserNombre"></span>
                </div>
                <div class="form__group">
                  <label class="form__label">Correo *</label>
                  <input type="email" id="adminUserCorreo" name="adminUserCorreo" class="form__input" placeholder="correo@email.com">
                  <span class="form__error" id="errorAdminUserCorreo"></span>
                </div>
              </div>
              <div style="display:flex;gap:.75rem">
                <button type="submit" class="btn btn--primary">
                  <span id="userAdminBtnLabel">Crear Usuario</span>
                </button>
                <button type="button" id="btnCancelarUserAdmin" class="btn btn--secondary hidden">Cancelar</button>
              </div>
            </form>
          </div>
        </section>

        <div class="messages-header">
          <h2 class="messages-header__title">Usuarios registrados</h2>
          <span class="messages-header__count" id="userAdminCount">0</span>
        </div>
        <div id="usersAdminList" class="tasks-container"></div>
      </div>

    </div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

> ### 💾 COMMIT
> ```bash
> git add index.html
> git commit -m "feat: HTML con panel usuario y panel admin con tabs de tareas y usuarios"
> ```

---

---

# PARTE 6 — Lógica principal

---

## Paso 10 — `src/main.js` · Reemplazar completamente

El `main.js` original tiene ~230 líneas y maneja solo el panel usuario. El nuevo tiene ~490 líneas y orquesta ambos paneles. Los cambios estructurales respecto al original son:

| Elemento | Original | Nuevo |
|---|---|---|
| Imports | `crearCardTarea`, `getTareas`, `getUsuario` vacío | + `crearCardTareaAdmin`, `crearCardUsuario`, `getTodasLasTareas`, `actualizarEstadoTarea`, `getUsuarios`, `crearUsuario`, `editarUsuario`, `eliminarUsuario` |
| Estado global | `isEditing`, `editTaskId` | Eliminados · + `todosUsuarios`, `todasTareas`, `editandoTareaAdmin`, `editTareaAdminId`, `editandoUser`, `editUserId` |
| `searchForm` submit | Fetch inline a `/users/` | Llama a `getUsuario()` importado |
| Form crear tarea | `taskForm` en panel usuario | **Eliminado** — las tareas las crea el admin |
| Panel admin | No existía | Toggle, tabs, CRUD tareas, CRUD usuarios |
| Cambio estado | No existía | Listener `change` en `tasksContainer` con PATCH |

Reemplazar **todo el contenido** con el `main.js` de la versión v7 del proyecto.

---

> ### 💾 COMMIT
> ```bash
> git add src/main.js
> git commit -m "feat: main.js con panel admin, CRUD tareas/usuarios y cambio de estado"
> ```

---

> ### 🚀 PR — Abrir Pull Request y crear versión 3.1.0
>
> La aplicación tiene el panel admin funcional con CRUD completo. Es momento de integrar.
>
> 1. Ir a GitHub y abrir un Pull Request de `feature/panel-admin` → `main`
> 2. Asignar a un compañero como revisor
> 3. Después de aprobar y hacer merge:
>
> ```bash
> git checkout main
> git pull origin main
> git tag v3.1.0
> git push origin v3.1.0
> ```

---

---

# PARTE 7 — Reglas de negocio

Crear una nueva rama para este grupo de cambios:

```bash
git checkout main
git pull origin main
git checkout -b fix/reglas-negocio
```

---

## Paso 11 — `src/main.js` · Corregir duplicación de tareas en el admin

**Causa del bug:** Al hacer click en el tab de Tareas, `cargarTareasAdmin()` se ejecutaba dos veces porque había dos listeners registrados sobre el mismo botón: uno en el `querySelectorAll('.tab-btn')` general y otro específico más abajo.

Buscar y **eliminar** este bloque en `main.js`:

```js
// ELIMINAR este bloque completo
document.querySelector('[data-tab="tab-admin-tareas"]')?.addEventListener('click', () => {
    resetAdminTaskForm();
    cargarTareasAdmin();
});
```

Luego buscar el listener general de tabs y modificar la línea de tareas para que también resetee el formulario:

```js
// ANTES
if (btn.dataset.tab === 'tab-admin-tareas')  cargarTareasAdmin();

// DESPUÉS
if (btn.dataset.tab === 'tab-admin-tareas')  { resetAdminTaskForm(); cargarTareasAdmin(); }
```

---

> ### 💾 COMMIT
> ```bash
> git add src/main.js
> git commit -m "fix: eliminar listener duplicado que causaba doble render de tareas en admin"
> ```

---

## Paso 12 — `src/api/usuarios/usuariosApi.js` · Verificar ID secuencial

Este cambio ya está incluido si copiaste el archivo en el Paso 5. Solo verificar que la función `crearUsuario` tenga este bloque **antes del `fetch`**:

```js
// Debe estar presente al inicio de crearUsuario
const todos = await getUsuarios(api_url);
const idsNumericos = todos
    .map(u => parseInt(u.id, 10))
    .filter(n => !isNaN(n));
const siguienteId = idsNumericos.length > 0
    ? String(Math.max(...idsNumericos) + 1)
    : '1';
```

Si no está, agregarlo antes de la llamada a `fetch`.

---

## Paso 13 — `src/ui/tareas.js` · Verificar bloqueo de tareas completadas

Este cambio ya está incluido si copiaste el archivo en el Paso 6. Solo verificar que tanto `crearCardTarea` como `crearCardTareaAdmin` tengan la condición en sus acciones:

```js
// Debe estar presente en ambas funciones
if (tarea.estado === 'Completada') {
    // badge — sin controles
} else {
    // select (usuario) o botón Editar (admin)
}
```

Si no está, aplicar la corrección del Paso 6 en las líneas correspondientes.

---

> ### 💾 COMMIT
> ```bash
> git add src/api/usuarios/usuariosApi.js src/ui/tareas.js
> git commit -m "fix: IDs secuenciales al crear usuario, tareas completadas no editables"
> ```

---

> ### 🚀 PR — Abrir Pull Request y crear versión 3.2.0
>
> 1. Ir a GitHub y abrir un Pull Request de `fix/reglas-negocio` → `main`
> 2. Después de aprobar y hacer merge:
>
> ```bash
> git checkout main
> git pull origin main
> git tag v3.2.0
> git push origin v3.2.0
> ```

---

---

# PARTE 8 — Validación de formularios

Crear una nueva rama:

```bash
git checkout main
git pull origin main
git checkout -b feat/validacion-formularios
```

---

## Paso 14 — `src/config/config.js` · Agregar reglas nuevas

Agregar las dos nuevas constantes **al final** del archivo sin tocar `reglas_documento`:

```js
// ANTES — solo tenía esto
export const api_url = "http://localhost:3001";
export const reglas_documento = {
    userDoc: { required: true, mensaje: "El campo no puede estar vacío", typeof: "text" },
};
```

```js
// DESPUÉS — agregar al final
export const api_url = "http://localhost:3001";

export const reglas_documento = {
    userDoc: { required: true, mensaje: "El campo no puede estar vacío", typeof: "text" },
};

export const reglas_tarea = {
    adminTaskTitulo: { required: true, mensaje: "El título es obligatorio",      typeof: "text"     },
    adminTaskDesc:   { required: true, mensaje: "La descripción es obligatoria", typeof: "textarea" },
};

export const reglas_usuario = {
    adminUserNombre: { required: true, mensaje: "El nombre es obligatorio", typeof: "text"  },
    adminUserCorreo: { required: true, mensaje: "El correo es obligatorio",  typeof: "email" },
};
```

---

> ### 💾 COMMIT
> ```bash
> git add src/config/config.js
> git commit -m "feat: reglas de validación para formularios de tareas y usuarios"
> ```

---

## Paso 15 — `src/service/validacionDocumento.js` · Extender sin romper lo existente

La función `validar` original se conserva intacta (solo se elimina el `console.log(form)` que tenía adentro, no afecta la lógica). Se añaden tres cosas nuevas. Reemplazar **todo el contenido**:

```js
// validar — función original del equipo, sin cambios de comportamiento
export const validar = (form, reglas) => {
    const errores = [];
    let valido = true;
    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];
        let { esvalido, mensaje } = validarCampo(campo, regla);
        valido = esvalido;
        if (!esvalido) {
            errores[name] = mensaje;
        }
    }
    if (Object.keys(errores).length != 0) {
        valido = false;
    }
    return { valido, errores }
}

// validarConUI — NUEVA: valida y marca/limpia la UI en tiempo real
export const validarConUI = (form, reglas) => {
    let valido = true;
    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];
        const spanError = document.getElementById(`error${capitalize(name)}`);
        const { esvalido, mensaje } = validarCampo(campo, regla);

        if (!esvalido) {
            valido = false;
            campo.classList.add('error');
            if (spanError) spanError.textContent = mensaje;
        } else {
            campo.classList.remove('error');
            if (spanError) spanError.textContent = '';
        }

        // Limpiar el error mientras el usuario escribe (se registra una sola vez)
        if (!campo._validacionListenerAdded) {
            campo.addEventListener('input', () => {
                if (campo.value.trim() !== '') {
                    campo.classList.remove('error');
                    if (spanError) spanError.textContent = '';
                }
            });
            campo._validacionListenerAdded = true;
        }
    }
    return { valido };
}

// limpiarErrores — NUEVA: limpia bordes y mensajes al hacer reset del form
export const limpiarErrores = (form, reglas) => {
    for (const name in reglas) {
        const campo = form.elements[name];
        const spanError = document.getElementById(`error${capitalize(name)}`);
        if (campo) campo.classList.remove('error');
        if (spanError) spanError.textContent = '';
    }
}

// validarCampo — versión mejorada de validarCampoTipoNumber con validación de email
const validarCampo = (elemento, regla) => {
    if (!elemento) return { esvalido: true };
    if (regla.required && elemento.value.trim() === '') {
        return { esvalido: false, mensaje: regla.mensaje }
    }
    if (regla.typeof === 'email' && elemento.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(elemento.value.trim())) {
            return { esvalido: false, mensaje: 'Ingresa un correo válido' }
        }
    }
    return { esvalido: true }
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
```

---

> ### 💾 COMMIT
> ```bash
> git add src/service/validacionDocumento.js
> git commit -m "feat: validarConUI y limpiarErrores para validación con feedback visual"
> ```

---

## Paso 16 — `src/main.js` · Conectar la validación en los submits

Cuatro cambios puntuales en `main.js`:

**1. Actualizar los imports al inicio del archivo:**

```js
// ANTES
import { validar } from "./service/validacionDocumento.js";
import { api_url, reglas_documento } from './config/config.js';

// DESPUÉS
import { validar, validarConUI, limpiarErrores } from "./service/validacionDocumento.js";
import { api_url, reglas_documento, reglas_tarea, reglas_usuario } from './config/config.js';
```

**2. En el submit de `adminTaskForm`, agregar validación justo después del `e.preventDefault()`:**

```js
document.getElementById('adminTaskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    // AGREGAR estas dos líneas
    const { valido } = validarConUI(form, reglas_tarea);
    if (!valido) return;

    const userIds = getCheckedAdminUsers(); // resto sin cambios
```

**3. En `resetAdminTaskForm`, agregar limpieza de errores:**

```js
function resetAdminTaskForm() {
    editandoTareaAdmin = false; editTareaAdminId = null;
    const form = document.getElementById('adminTaskForm');
    form?.reset();
    limpiarErrores(form, reglas_tarea);   // AGREGAR esta línea
    // ... resto sin cambios
}
```

**4. En el submit de `userAdminForm`, agregar validación:**

```js
document.getElementById('userAdminForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    // AGREGAR estas dos líneas
    const { valido } = validarConUI(form, reglas_usuario);
    if (!valido) return;

    const datos = { // resto sin cambios
```

**5. En `resetUserForm`, agregar limpieza de errores:**

```js
function resetUserForm() {
    editandoUser = false; editUserId = null;
    const form = document.getElementById('userAdminForm');
    form?.reset();
    limpiarErrores(form, reglas_usuario);   // AGREGAR esta línea
    // ... resto sin cambios
}
```

---

> ### 💾 COMMIT
> ```bash
> git add src/main.js
> git commit -m "feat: conectar validarConUI en formularios de tareas y usuarios del admin"
> ```

---

> ### 🚀 PR — Abrir Pull Request y crear versión 3.3.0
>
> 1. Ir a GitHub y abrir un Pull Request de `feat/validacion-formularios` → `main`
> 2. Después de aprobar y hacer merge:
>
> ```bash
> git checkout main
> git pull origin main
> git tag v3.3.0
> git push origin v3.3.0
> ```

---

---

## Verificación final

```bash
npm install
npm start
# → http://localhost:5173
```

IDs de usuario válidos para el panel usuario: los definidos en `db.json` (por defecto `10103` al `10107`).

---

## Resumen de archivos por rama

| Rama | Archivo | Acción |
|------|---------|--------|
| `feature/panel-admin` | `package.json` | Modificar scripts |
| `feature/panel-admin` | `db.json` | Crear |
| `feature/panel-admin` | `src/api/tareas/getTareas.js` | Reemplazar |
| `feature/panel-admin` | `src/api/tareas/updateTarea.js` | Agregar al final |
| `feature/panel-admin` | `src/api/usuarios/usuariosApi.js` | Crear |
| `feature/panel-admin` | `src/ui/tareas.js` | Reemplazar |
| `feature/panel-admin` | `src/ui/usuarios.js` | Crear |
| `feature/panel-admin` | `src/styles.css` | Agregar al final |
| `feature/panel-admin` | `index.html` | Reemplazar |
| `feature/panel-admin` | `src/main.js` | Reemplazar |
| `fix/reglas-negocio` | `src/main.js` | Corregir listener doble |
| `fix/reglas-negocio` | `src/api/usuarios/usuariosApi.js` | Verificar |
| `fix/reglas-negocio` | `src/ui/tareas.js` | Verificar |
| `feat/validacion-formularios` | `src/config/config.js` | Agregar reglas |
| `feat/validacion-formularios` | `src/service/validacionDocumento.js` | Reemplazar |
| `feat/validacion-formularios` | `src/main.js` | 5 cambios puntuales |
