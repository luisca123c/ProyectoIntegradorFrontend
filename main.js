// --- Imports (Combinados) ---
import { validar } from "./service/validacionDocumento.js";
import { notificarExito, notificarError, notificarInfo } from './service/notificaciones.js';
import { crearCardTarea } from './ui/tareas.js';
import { getTareas } from './api/tareas/getTareas.js';
import { postTarea } from './api/tareas/postTareas.js';
import { eliminarTarea } from './api/tareas/deleteTarea.js';
import { editarTarea } from './api/tareas/updateTarea.js';
import { api_url, reglas_documento } from './config/config.js';
import { inicializarOrdenamiento } from './service/ordenamientoTareas.js';
import { inicializarFiltros } from './service/filtroTareas.js';

// --- Selección de elementos ---
const searchForm = document.getElementById('searchForm');
const taskForm = document.getElementById('taskForm');
const userDocInput = document.getElementById('userDoc');
const userInfoSection = document.getElementById('userInfo');
const taskSection = document.getElementById('taskSection');
const tasksContainer = document.getElementById('tasksContainer');
const taskCountLabel = document.getElementById('taskCount');
const emptyTasksState = document.getElementById('emptyTasks');
const searchError = document.getElementById('searchError');
const contenedorOrden = document.getElementById('ordenContainer');
const contenedorFiltros = document.getElementById('filtrosContainer');

// --- Estado ---
let currentUser = null;
let totalTasks = 0;
let isEditing = false;
let editTaskId = null;
let tareasActuales = [];
let controlesFiltro = null;
let controlesOrden = null;

// --- Utilidades ---
function updateMessageCount() {
    taskCountLabel.textContent = `${totalTasks} ${totalTasks === 1 ? 'tarea' : 'tareas'}`;
}
function hideEmptyState() { if (emptyTasksState) emptyTasksState.classList.add('hidden'); }
function showEmptyState() { if (emptyTasksState) emptyTasksState.classList.remove('hidden'); }

function getCurrentTimestamp() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date().toLocaleDateString('es-ES', options);
}

function resetForm() {
    isEditing = false;
    editTaskId = null;
    taskForm.reset();
    document.querySelector('#taskSection .card__title').textContent = "2. Registrar Nueva Tarea";
    const btnText = document.querySelector('#taskForm .btn__text');
    if (btnText) btnText.textContent = "Asignar Tarea";
}

// --- Lógica de Renderizado ---
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
    tareas.forEach(t => tasksContainer.insertBefore(crearCardTarea(t), emptyTasksState));
    totalTasks = tareas.length;
    updateMessageCount();
}

// --- Render y Carga de Datos ---
async function renderTareasUsuario(userId) {
    tareasActuales = await getTareas(api_url, userId); 
    
    // Activar interfaces si existen
    if (controlesFiltro) controlesFiltro.chequearYActivar();
    if (controlesOrden) controlesOrden.chequearYActivar();
    
    renderizarTareas(tareasActuales); 
}

// --- Inicialización de Módulos ---
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

// --- Acciones: Eliminar y Editar ---
async function processEliminar(id) {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
        const exito = await eliminarTarea(api_url, id);
        if (exito) {
            // Tu lógica: actualiza el arreglo maestro para que los filtros sigan funcionando
            tareasActuales = tareasActuales.filter(t => t.id != id);
            renderizarTareas(tareasActuales);
            notificarExito('Tarea eliminada correctamente.');
        } else {
            notificarError('No se pudo eliminar la tarea.');
        }
    }
}

function prepararEdicion(tareaCard) {
    isEditing = true;
    editTaskId = tareaCard.dataset.id;
    const filas = tareaCard.querySelectorAll('.task-card__value');

    document.getElementById('taskTitle').value = filas[0].textContent;
    document.getElementById('taskDesc').value = filas[1].textContent;
    document.getElementById('taskPriority').value = filas[2].textContent.charAt(0).toUpperCase() + filas[2].textContent.slice(1).toLowerCase();
    document.getElementById('taskStatus').value = filas[3].textContent;

    document.querySelector('#taskSection .card__title').textContent = "Modificar Tarea";
    const btnText = document.querySelector('#taskForm .btn__text');
    if (btnText) btnText.textContent = "Guardar Cambios";

    taskSection.scrollIntoView({ behavior: 'smooth' });
}

// --- Eventos ---
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchError.textContent = ""; 
    
    let check = validar(e.target, reglas_documento);
    if (!check.valido) {
        searchError.textContent = check.errores.userDoc;
        return;
    }

    try {
        const res = await fetch(`${api_url}/users/${userDocInput.value.trim()}`);
        if (!res.ok) throw new Error("Usuario no encontrado");
        
        const user = await res.json();
        currentUser = user;

        userInfoSection.classList.remove('hidden');
        taskSection.classList.remove('hidden');

        document.getElementById('infoNombre').textContent = user.nombre_completo || user.name || "N/A";
        document.getElementById('infoCorreo').textContent = user.correo || user.email || "N/A";

        limpiarTareas();
        await renderTareasUsuario(user.id);
        resetForm();
        notificarInfo(`Usuario ${user.nombre_completo || user.name} cargado.`);
    } catch (error) {
        userInfoSection.classList.add('hidden');
        taskSection.classList.add('hidden');
        searchError.textContent = "Usuario no encontrado en el sistema";
        notificarError('No se encontró el usuario.');
    }
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskData = {
        userId: currentUser.id,
        titulo: document.getElementById('taskTitle').value,
        descripcion: document.getElementById('taskDesc').value,
        prioridad: document.getElementById('taskPriority').value,
        estado: document.getElementById('taskStatus').value,
        fecha_registro: getCurrentTimestamp()
    };

    if (isEditing) {
        const ok = await editarTarea(api_url, editTaskId, taskData);
        if (ok) {
            await renderTareasUsuario(currentUser.id);
            resetForm();
            notificarExito('Tarea actualizada correctamente.');
        }
    } else {
        const nueva = await postTarea(api_url, taskData);
        if (nueva) {
            await renderTareasUsuario(currentUser.id);
            resetForm();
            notificarExito('Tarea creada correctamente.');
        } else {
            notificarError('No se pudo crear la tarea.');
        }
    }
});

tasksContainer.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('btn-eliminar')) await processEliminar(id);
    if (e.target.classList.contains('btn-editar')) prepararEdicion(e.target.closest('.task-card'));
});