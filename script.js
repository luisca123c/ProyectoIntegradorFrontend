/**
 * ============================================
 *                Importaciones
 * ============================================
*/


/**
 * ============================================
 * ejercicio de manipulacion del dom - gestion de tareas
 * ============================================
 */

// selección de elementos del dom
const searchForm = document.getElementById('searchForm'); 
const taskForm = document.getElementById('taskForm');

// campos de entrada (actualizados según el nuevo html)
const userDocInput = document.getElementById('userDoc');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const taskStatusInput = document.getElementById('taskStatus');
const taskPriorityInput = document.getElementById('taskPriority');

// elementos de visualización
const searchError = document.getElementById('searchError');
const userInfoSection = document.getElementById('userInfo');
const taskSection = document.getElementById('taskSection');
const taskTableBody = document.getElementById('taskTableBody');
const taskCountLabel = document.getElementById('taskCount');
const emptyTasksState = document.getElementById('emptyTasks');

// variables de estado
let currentUser = null;
let totalTasks = 0;
const api_url = "http://localhost:3001";

// ============================================
//            funciones y metodos
// ============================================

/**
 * valida que un campo no esté vacío ni contenga solo espacios en blanco
 * @param {string} value - el valor a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
function isValidInput(value) {
    // retorna true si después de trim() el string tiene longitud > 0
    if(value.trim().length > 0)
    {
        return true
    }
    else {
        return false
    }
}

/**
 * muestra un mensaje de error en un elemento específico
 */
function showError(errorElement, message) {
    errorElement.textContent = "";
    errorElement.classList.add(`error`);
    
    // validación según el id del elemento de error del buscador
    if(errorElement.id == "searchError")
    {
        errorElement.append(message);
    } else {
        errorElement.textContent = message;
    }
}

/**
 * limpia el mensaje de error de un elemento específico
 */
function clearError(errorElement) {
    errorElement.classList.remove(`error`);
    errorElement.textContent = "";
}

/**
 * Valida todos los campos del formulario
 * @returns {boolean} - true si todos los campos son válidos, false si alguno no lo es
 */
/**
 * valida todos los campos del formulario de tareas
 */
function validateForm() {
    const title = taskTitleInput.value;
    const desc = taskDescInput.value;
    let isValid = true;
    
    if (!isValidInput(title)) {
        taskTitleInput.classList.add('error');
        isValid = false;
    } else {
        taskTitleInput.classList.remove('error');
    }
    
    if (!isValidInput(desc)) {
        taskDescInput.classList.add('error');
        isValid = false;
    } else {
        taskDescInput.classList.remove('error');
    }
    
    return isValid;
}

/**
 * Obtiene la fecha y hora actual formateada
 * @returns {string} - Fecha y hora en formato legible
 */
function getCurrentTimestamp() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
}

/**
 * obtiene las iniciales de un nombre
 * @param {string} name - nombre completo
 * @returns {string} - iniciales en mayúsculas
 */
function getInitials(name) {
    // todo: implementar función para obtener iniciales
    // 1. separar el nombre por espacios usando split(' ')
    const words = name.split(' ');
    // 4. si solo hay una palabra, retornar las dos primeras letras
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    // 2. tomar la primera letra de cada palabra
    // 3. unirlas y convertirlas a mayúsculas
    let initials = words[0][0] + words[words.length - 1][0];
    return initials.toUpperCase();
}

/**
 * actualiza el contador de mensajes
 */
function updateMessageCount() {
    // todo: implementar actualización del contador
    // pista: usa template literals para crear el texto
    taskCountLabel.textContent = `${totalTasks} ${totalTasks === 1 ? 'tarea' : 'tareas'}`;
}

/**
 * oculta el estado vacío (mensaje cuando no hay mensajes)
 */
function hideEmptyState() {
    // todo: implementar función para ocultar el estado vacío
    // pista: añade la clase 'hidden' al elemento emptyTasksState
    if (emptyTasksState) {
        emptyTasksState.classList.add('hidden');
    }
}

/**
 * muestra el estado vacío (mensaje cuando no hay mensajes)
 */
function showEmptyState() {
    // todo: implementar función para mostrar el estado vacío
    // pista: remueve la clase 'hidden' del elemento emptyState
    if (emptyTasksState) {
        emptyTasksState.classList.remove('hidden');
    }
}

/**
 * crea un nuevo elemento de mensaje en el dom
 * @param {string} userName - nombre del usuario
 * @param {string} message - contenido del mensaje
 */
function createMessageElement(userName, message) { 
    // paso 1: crear el contenedor principal (en este caso una fila de tabla)
    const row = document.createElement('tr');
    // paso 2: crear la estructura html (adaptada a la tabla del nuevo html)
    const title = taskTitleInput.value;
    const desc = taskDescInput.value;
    const priority = taskPriorityInput.value;
    const status = taskStatusInput.value;
    const priorityClass = priority.toLowerCase();
    row.innerHTML = `
        <td><strong>${title}</strong></td>
        <td>${desc}</td>
        <td><span class="priority-tag ${priorityClass}">${priority}</span></td>
        <td>${status}</td>
    `;
    // paso 3: insertar el nuevo elemento en el contenedor
    taskTableBody.insertBefore(row, taskTableBody.firstChild);
    // paso 4: incrementar el contador
    totalTasks++;
    // paso 5: actualizar el contador visual
    updateMessageCount();
    // paso 6: ocultar el estado vacío
    hideEmptyState();
}

// ============================================
//                  EVENTOS
// ============================================

/**
 * maneja la búsqueda de usuario en el servidor
 */
async function handleSearchSubmit(event) {
    // prevenir comportamiento por defecto
    event.preventDefault();
    
    // obtener valor del documento
    const docValue = userDocInput.value;

    if(isValidInput(docValue)) {
        try {
            // realizar peticion al puerto 3000
            const response = await fetch(`${api_url}/users/${docValue}`);
            
            if (!response.ok) {
                throw new Error("usuario no encontrado");
            }

            const user = await response.json();

            // guardar usuario en el estado global
            currentUser = user;
            
            // actualizar interfaz con los datos del json
            document.getElementById('infoNombre').textContent = user.nombre_completo;
            document.getElementById('infoCorreo').textContent = user.correo;
            
            // mostrar secciones de tareas y usuario
            userInfoSection.classList.remove('hidden');
            taskSection.classList.remove('hidden');
            
            // limpiar errores previos
            clearError(searchError);
            
            console.log('usuario cargado correctamente');

        } catch (error) {
            // manejar error si el usuario no existe en db.json
            currentUser = null;
            userInfoSection.classList.add('hidden');
            taskSection.classList.add('hidden');
            showError(searchError, "usuario no registrado en el sistema");
        }
    } else {
        showError(searchError, "el campo no puede estar vacio");
    }
}

/**
 * maneja el evento de envío del formulario de tareas
 * @param {Event} event - evento del formulario
 */
async function handleFormSubmit(event) {    
    // paso 1: prevenir el comportamiento por defecto del formulario
    event.preventDefault();

    // paso 2: validar el formulario
    if(validateForm()) {
        // paso 3: obtener los valores de los campos
        const title = taskTitleInput.value;
        const desc = taskDescInput.value;
        const priority = taskPriorityInput.value;
        const status = taskStatusInput.value;

        // objeto para enviar al servidor
        const newTask = {
            userId: currentUser.id,
            titulo: title,
            descripcion: desc,
            prioridad: priority,
            estado: status,
            fecha_registro: getCurrentTimestamp()
        };

        try {
            // persistir en db.json a través de la api
            const response = await fetch(`${api_url}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if(response.ok) {
                // paso 4: crear el nuevo elemento de mensaje (fila de tabla)
                createMessageElement(currentUser.nombre_completo, title);
                
                // paso 5: limpiar el formulario
                taskForm.reset();
                
                // paso 6: limpiar los errores
                clearError(document.getElementById('taskNameError')); // si existen los spans
                clearError(document.getElementById('taskDescriptionError'));

                // paso 7: opcional - enfocar el primer campo
                taskTitleInput.focus();
            }
        } catch (error) {
            console.error("error al guardar en el servidor");
        }
    }
}

/**
 * limpia los errores cuando el usuario empieza a escribir
 */
function handleInputChange(event) {
    // todo: implementar limpieza de errores al escribir
    const target = event.target;
    
    // remover clase de error visual
    target.classList.remove('error');
    
    // si es el buscador, limpiar el span de error especifico
    if (target.id === "userDoc") {
        clearError(searchError);
    }
}

// registro de event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log(' dom completamente cargado y eventos vinculados');
    
    // registrar el evento 'submit' en el buscador de usuario
    searchForm.addEventListener('submit', handleSearchSubmit);

    // registrar el evento 'submit' en el formulario de tareas
    taskForm.addEventListener('submit', handleFormSubmit);

    // registrar eventos 'input' en los campos para limpieza dinamica
    userDocInput.addEventListener('input', handleInputChange);
    taskTitleInput.addEventListener('input', handleInputChange);
    taskDescInput.addEventListener('input', handleInputChange);
});
