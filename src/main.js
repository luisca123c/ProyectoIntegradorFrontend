// ============================================================
// IMPORTS
// ============================================================
import { validar, validarConUI, limpiarErrores } from "./service/validacionDocumento.js";
import { notificarExito, notificarError, notificarInfo } from './service/notificaciones.js';
import { crearCardTarea, crearCardTareaAdmin } from './ui/tareas.js';
import { crearCardUsuario } from './ui/usuarios.js';
import { getTareas, getTodasLasTareas } from './api/tareas/getTareas.js';
import { postTarea } from './api/tareas/postTareas.js';
import { eliminarTarea } from './api/tareas/deleteTarea.js';
import { editarTarea, actualizarEstadoTarea } from './api/tareas/updateTarea.js';
import { getUsuario, getUsuarios, crearUsuario, editarUsuario, eliminarUsuario, toggleActivoUsuario } from './api/usuarios/usuariosApi.js';
import { api_url, reglas_documento, reglas_tarea, reglas_usuario } from './config/config.js';
import { inicializarOrdenamiento } from './service/ordenamientoTareas.js';
import { inicializarFiltros } from './service/filtroTareas.js';
import { exportarTareasJSON } from './service/exportarTareas.js';

// ============================================================
// ESTADO GLOBAL
// ============================================================
let currentUser     = null;
let totalTasks      = 0;
let tareasActuales  = [];   // tareas del usuario activo (panel usuario)
let controlesFiltro = null;
let controlesOrden  = null;

// Estado panel admin
let todosUsuarios   = [];
let todasTareas     = [];
let editandoTareaAdmin = false;
let editTareaAdminId   = null;
let editandoUser    = false;
let editUserId      = null;

// ============================================================
// SELECTORES DOM — Panel Usuario (igual que el original)
// ============================================================
const searchForm      = document.getElementById('searchForm');
const userDocInput    = document.getElementById('userDoc');
const userInfoSection = document.getElementById('userInfo');
const tasksContainer  = document.getElementById('tasksContainer');
const taskCountLabel  = document.getElementById('taskCount');
const emptyTasksState = document.getElementById('emptyTasks');
const searchError     = document.getElementById('searchError');
const contenedorOrden    = document.getElementById('ordenContainer');
const contenedorFiltros  = document.getElementById('filtrosContainer');
const btnExportar        = document.getElementById('btnExportar');

// Selectores panel admin
const btnAbrirAdmin    = document.getElementById('btnAbrirAdmin');
const btnCerrarAdmin   = document.getElementById('btnCerrarAdmin');
const panelAdmin       = document.getElementById('panelAdmin');
const panelUsuario     = document.getElementById('panelUsuario');

// ============================================================
// UTILIDADES — exactas del original
// ============================================================
function updateMessageCount() {
    taskCountLabel.textContent = `${totalTasks} ${totalTasks === 1 ? 'tarea' : 'tareas'}`;
}
function hideEmptyState() { if (emptyTasksState) emptyTasksState.classList.add('hidden'); }
function showEmptyState()  { if (emptyTasksState) emptyTasksState.classList.remove('hidden'); }

function getCurrentTimestamp() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date().toLocaleDateString('es-ES', options);
}



// ============================================================
// RENDERIZADO — igual que el original
// ============================================================
function limpiarTareas() {
    tasksContainer.querySelectorAll('.task-card').forEach(card => card.remove());
    totalTasks = 0;
    updateMessageCount();
    showEmptyState();
}

function renderizarTareas(tareas) {
    tasksContainer.querySelectorAll('.task-card').forEach(c => c.remove());
    if (tareas.length === 0) {
        showEmptyState();
        totalTasks = 0;
        updateMessageCount();
        return;
    }
    hideEmptyState();
    tareas.forEach(t => tasksContainer.insertBefore(crearCardTarea(t, todosUsuarios), emptyTasksState));
    totalTasks = tareas.length;
    updateMessageCount();
}

async function renderTareasUsuario(userId) {
    tareasActuales = await getTareas(api_url, userId);
    if (controlesFiltro) controlesFiltro.chequearYActivar();
    if (controlesOrden)  controlesOrden.chequearYActivar();
    renderizarTareas(tareasActuales);
}



// ============================================================
// MÓDULOS: Filtros y Ordenamiento — igual que el original
// ============================================================
if (contenedorFiltros) {
    controlesFiltro = inicializarFiltros(
        contenedorFiltros,
        (filtradas) => renderizarTareas(filtradas),
        () => tareasActuales
    );
}

if (contenedorOrden) {
    controlesOrden = inicializarOrdenamiento(
        contenedorOrden,
        (ordenadas) => renderizarTareas(ordenadas),
        () => tareasActuales
    );
}

// ============================================================
// EXPORTAR — igual que el original
// ============================================================
if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        const tareasVisibles = [...tasksContainer.querySelectorAll('.task-card')]
            .map(card => tareasActuales.find(t => String(t.id) === card.dataset.id))
            .filter(Boolean);

        const resultado = exportarTareasJSON(tareasVisibles);
        if (resultado.exito) {
            notificarExito(`Se exportaron ${resultado.cantidad} tareas correctamente.`);
        } else {
            notificarInfo('No hay tareas visibles para exportar.');
        }
    });
}

// ============================================================
// PANEL USUARIO — Buscar usuario (igual que el original)
// ============================================================
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchError.textContent = "";

    let check = validar(e.target, reglas_documento);
    if (!check.valido) {
        searchError.textContent = check.errores.userDoc;
        return;
    }

    try {
        const user = await getUsuario(api_url, userDocInput.value.trim());
        currentUser = user;

        if (todosUsuarios.length === 0) todosUsuarios = await getUsuarios(api_url);

        userInfoSection.classList.remove('hidden');

        document.getElementById('infoNombre').textContent = user.nombre_completo || "N/A";
        document.getElementById('infoCorreo').textContent = user.correo || "N/A";

        // Poblar checkboxes con los demás usuarios (excluir al usuario actual)
        limpiarTareas();
        await renderTareasUsuario(user.id);
        notificarInfo(`Usuario ${user.nombre_completo} cargado.`);
    } catch (error) {
        userInfoSection.classList.add('hidden');
        searchError.textContent = "Usuario no encontrado en el sistema";
        notificarError('No se encontró el usuario.');
    }
});



// ============================================================
// PANEL USUARIO — Clicks en cards (solo estado, no hay editar/eliminar)
// ============================================================

// Cambiar estado desde select en la card del usuario
tasksContainer.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('select-estado')) return;
    const id     = e.target.dataset.id;
    const estado = e.target.value;
    const ok = await actualizarEstadoTarea(api_url, id, estado);
    if (ok) {
        tareasActuales = tareasActuales.map(t => String(t.id) === String(id) ? { ...t, estado } : t);
        notificarExito(`Estado actualizado a "${estado}".`);
    } else {
        notificarError('No se pudo actualizar el estado.');
    }
});

// ============================================================
// PANEL ADMIN — Toggle visibilidad
// ============================================================
if (btnAbrirAdmin) {
    btnAbrirAdmin.addEventListener('click', () => {
        panelUsuario.classList.add('hidden');
        panelAdmin.classList.remove('hidden');
        iniciarAdmin();
    });
}

if (btnCerrarAdmin) {
    btnCerrarAdmin.addEventListener('click', () => {
        panelAdmin.classList.add('hidden');
        panelUsuario.classList.remove('hidden');
    });
}

// Tabs del panel admin
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'tab-admin-tareas')  { resetAdminTaskForm(); cargarTareasAdmin(); }
        if (btn.dataset.tab === 'tab-admin-usuarios') { resetUserForm(); cargarUsuariosAdmin(); }
        if (btn.dataset.tab === 'tab-dashboard')       cargarDashboard();
    });
});

async function iniciarAdmin() {
    if (todosUsuarios.length === 0) todosUsuarios = await getUsuarios(api_url);
    await cargarDashboard();
}

// ============================================================
// ADMIN — Dashboard
// ============================================================
async function cargarDashboard() {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;
    grid.innerHTML = '';
    try {
        const [tasks, users] = await Promise.all([
            getTodasLasTareas(api_url),
            getUsuarios(api_url)
        ]);
        const stats = [
            { num: tasks.length,                             label: 'Total Tareas',   clase: 'stat--primary' },
            { num: tasks.filter(t => t.estado === 'Pendiente').length,   label: 'Pendientes',     clase: 'stat--warning' },
            { num: tasks.filter(t => t.estado === 'En Progreso').length, label: 'En Progreso',    clase: 'stat--info' },
            { num: tasks.filter(t => t.estado === 'Completada').length,  label: 'Completadas',    clase: 'stat--success' },
            { num: tasks.filter(t => t.prioridad === 'Alta').length,     label: 'Alta Prioridad', clase: 'stat--danger' },
            { num: `${users.filter(u => u.activo).length}/${users.length}`, label: 'Usuarios Activos', clase: 'stat--neutral' }
        ];
        stats.forEach(s => {
            const card = document.createElement('div');
            card.classList.add('stat-card', s.clase);
            const num = document.createElement('span');
            num.classList.add('stat-card__num');
            num.textContent = s.num;
            const lbl = document.createElement('span');
            lbl.classList.add('stat-card__label');
            lbl.textContent = s.label;
            card.appendChild(num);
            card.appendChild(lbl);
            grid.appendChild(card);
        });
    } catch { grid.textContent = 'Error al cargar estadísticas'; }
}

// ============================================================
// ADMIN — Tareas
// ============================================================
async function cargarTareasAdmin() {
    const lista = document.getElementById('adminTasksList');
    if (!lista) return;
    lista.innerHTML = '';
    if (todosUsuarios.length === 0) todosUsuarios = await getUsuarios(api_url);
    todasTareas = await getTodasLasTareas(api_url);
    const estado    = document.getElementById('filtroAdminEstado')?.value || '';
    const prioridad = document.getElementById('filtroAdminPrioridad')?.value || '';
    const userId    = document.getElementById('filtroAdminUser')?.value?.trim() || '';

    let result = [...todasTareas];
    if (estado)    result = result.filter(t => t.estado    === estado);
    if (prioridad) result = result.filter(t => t.prioridad === prioridad);
    if (userId)    result = result.filter(t => (t.userIds || []).includes(String(userId)));

    const contador = document.getElementById('adminTaskCount');
    if (contador) contador.textContent = result.length;

    if (result.length === 0) {
        const p = document.createElement('p');
        p.classList.add('filtros__placeholder');
        p.textContent = 'No hay tareas con esos filtros.';
        lista.appendChild(p);
        return;
    }
    result.forEach(t => lista.appendChild(crearCardTareaAdmin(t, todosUsuarios)));
}

// Poblar checkboxes del form de tarea admin
async function poblarCheckboxAdmin(seleccionados = []) {
    const cont = document.getElementById('checkboxAdminUsuarios');
    if (!cont) return;
    cont.innerHTML = '';
    if (todosUsuarios.length === 0) todosUsuarios = await getUsuarios(api_url);
    todosUsuarios.filter(u => u.activo).forEach(u => {
        const label = document.createElement('label');
        label.classList.add('checkbox-label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = u.id;
        cb.classList.add('cb-admin-asignar');
        if (seleccionados.includes(String(u.id))) cb.checked = true;
        label.appendChild(cb);
        label.appendChild(document.createTextNode(` ${u.nombre_completo}`));
        cont.appendChild(label);
    });
}

const getCheckedAdminUsers = () =>
    [...document.querySelectorAll('.cb-admin-asignar:checked')].map(cb => cb.value);

function resetAdminTaskForm() {
    editandoTareaAdmin = false; editTareaAdminId = null;
    const form = document.getElementById('adminTaskForm');
    form?.reset();
    limpiarErrores(form, reglas_tarea);
    const titulo = document.getElementById('adminTaskFormTitle');
    if (titulo) titulo.textContent = '➕ Nueva Tarea';
    const btnLbl = document.getElementById('adminTaskBtnLabel');
    if (btnLbl) btnLbl.textContent = 'Crear Tarea';
    const btnCancel = document.getElementById('btnCancelarAdminTask');
    if (btnCancel) btnCancel.classList.add('hidden');
    poblarCheckboxAdmin();
}

document.getElementById('adminTaskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    // Validar campos obligatorios
    const { valido } = validarConUI(form, reglas_tarea);
    if (!valido) return;

    const userIds = getCheckedAdminUsers();
    if (userIds.length === 0) { notificarError('Selecciona al menos un usuario'); return; }
    const datos = {
        userIds,
        titulo:         document.getElementById('adminTaskTitulo').value.trim(),
        descripcion:    document.getElementById('adminTaskDesc').value.trim(),
        estado:         document.getElementById('adminTaskEstado').value,
        prioridad:      document.getElementById('adminTaskPrioridad').value,
        fecha_registro: getCurrentTimestamp()
    };
    try {
        if (editandoTareaAdmin) {
            await editarTarea(api_url, editTareaAdminId, datos);
            notificarExito('Tarea actualizada ✓');
        } else {
            await postTarea(api_url, datos);
            notificarExito('Tarea creada ✓');
        }
        resetAdminTaskForm();
        await cargarTareasAdmin();
        await cargarDashboard();
    } catch { notificarError('Error al guardar tarea'); }
});

document.getElementById('btnCancelarAdminTask')?.addEventListener('click', resetAdminTaskForm);

// Filtros admin
document.getElementById('btnFiltrarAdmin')?.addEventListener('click', cargarTareasAdmin);
document.getElementById('btnLimpiarAdmin')?.addEventListener('click', () => {
    ['filtroAdminEstado', 'filtroAdminPrioridad', 'filtroAdminUser'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    cargarTareasAdmin();
});

// Delegación clicks en lista admin tareas
document.getElementById('adminTasksList')?.addEventListener('click', async (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.classList.contains('btn-editar-admin')) {
        const t = todasTareas.find(t => String(t.id) === String(id));
        if (!t) return;
        editandoTareaAdmin = true; editTareaAdminId = id;
        document.getElementById('adminTaskFormTitle').textContent = '✏️ Editar Tarea';
        document.getElementById('adminTaskBtnLabel').textContent  = 'Guardar Cambios';
        document.getElementById('btnCancelarAdminTask').classList.remove('hidden');
        document.getElementById('adminTaskTitulo').value    = t.titulo;
        document.getElementById('adminTaskDesc').value      = t.descripcion || '';
        document.getElementById('adminTaskEstado').value    = t.estado;
        document.getElementById('adminTaskPrioridad').value = t.prioridad;
        poblarCheckboxAdmin(t.userIds || []);
        document.getElementById('adminTaskFormCard').scrollIntoView({ behavior: 'smooth' });
    }

    if (e.target.classList.contains('btn-eliminar-admin')) {
        if (!confirm('¿Eliminar esta tarea?')) return;
        await eliminarTarea(api_url, id);
        notificarExito('Tarea eliminada ✓');
        await cargarTareasAdmin();
        await cargarDashboard();
    }
});

// ============================================================
// ADMIN — Usuarios
// ============================================================
async function cargarUsuariosAdmin() {
    const lista = document.getElementById('usersAdminList');
    if (!lista) return;
    lista.innerHTML = '';
    todosUsuarios = await getUsuarios(api_url);
    const contador = document.getElementById('userAdminCount');
    if (contador) contador.textContent = todosUsuarios.length;
    todosUsuarios.forEach(u => lista.appendChild(crearCardUsuario(u)));
}

function resetUserForm() {
    editandoUser = false; editUserId = null;
    const form = document.getElementById('userAdminForm');
    form?.reset();
    limpiarErrores(form, reglas_usuario);
    const titulo = document.getElementById('userAdminFormTitle');
    if (titulo) titulo.textContent = '➕ Nuevo Usuario';
    const btnLbl = document.getElementById('userAdminBtnLabel');
    if (btnLbl) btnLbl.textContent = 'Crear Usuario';
    const btnCancel = document.getElementById('btnCancelarUserAdmin');
    if (btnCancel) btnCancel.classList.add('hidden');
}

document.querySelector('[data-tab="tab-admin-usuarios"]')?.addEventListener('click', () => {
    resetUserForm();
    cargarUsuariosAdmin();
});

document.getElementById('userAdminForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    // Validar campos obligatorios
    const { valido } = validarConUI(form, reglas_usuario);
    if (!valido) return;

    const datos = {
        nombre_completo: document.getElementById('adminUserNombre').value.trim(),
        correo:          document.getElementById('adminUserCorreo').value.trim()
    };
    try {
        if (editandoUser) {
            const userActual = todosUsuarios.find(u => String(u.id) === String(editUserId));
            await editarUsuario(api_url, editUserId, { ...userActual, ...datos });
            notificarExito('Usuario actualizado ✓');
        } else {
            await crearUsuario(api_url, datos);
            notificarExito('Usuario creado ✓');
        }
        resetUserForm();
        await cargarUsuariosAdmin();
    } catch { notificarError('Error al guardar usuario'); }
});

document.getElementById('btnCancelarUserAdmin')?.addEventListener('click', resetUserForm);

document.getElementById('usersAdminList')?.addEventListener('click', async (e) => {
    const card = e.target.closest('.user-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.classList.contains('btn-editar-user')) {
        const u = todosUsuarios.find(u => String(u.id) === String(id));
        if (!u) return;
        editandoUser = true; editUserId = id;
        document.getElementById('userAdminFormTitle').textContent = '✏️ Editar Usuario';
        document.getElementById('userAdminBtnLabel').textContent  = 'Guardar Cambios';
        document.getElementById('btnCancelarUserAdmin').classList.remove('hidden');
        document.getElementById('adminUserNombre').value = u.nombre_completo;
        document.getElementById('adminUserCorreo').value = u.correo;
        document.getElementById('userAdminForm').scrollIntoView({ behavior: 'smooth' });
    }

    if (e.target.classList.contains('btn-toggle-user')) {
        const u = todosUsuarios.find(u => String(u.id) === String(id));
        if (!u) return;
        await toggleActivoUsuario(api_url, id, !u.activo);
        notificarInfo(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
        await cargarUsuariosAdmin();
    }

    if (e.target.classList.contains('btn-eliminar-user')) {
        if (!confirm('¿Eliminar este usuario?')) return;
        await eliminarUsuario(api_url, id);
        notificarExito('Usuario eliminado ✓');
        await cargarUsuariosAdmin();
    }
});