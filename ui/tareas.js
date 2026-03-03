// Función auxiliar 1: Crea una fila de texto simple (Sin innerHTML)
const crearFila = (label, value) => {
    const div = document.createElement('div');
    div.classList.add('task-card__row');

    const spanLabel = document.createElement('span');
    spanLabel.classList.add('task-card__label');
    spanLabel.textContent = `${label}:`;

    const spanValue = document.createElement('span');
    spanValue.classList.add('task-card__value');
    // Usamos el nombre de propiedad correcto: fecha_registro
    spanValue.textContent = value || 'N/A';

    div.appendChild(spanLabel);
    div.appendChild(spanValue);
    return div;
};

// Función auxiliar 2: Crea una fila que contiene un elemento complejo (badge)
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

export const crearCardTarea = (tarea) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    // 1. Título y Descripción
    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));

    // 2. Fecha de Registro (Corregido: una sola vez y con el nombre fecha_registro)
    card.appendChild(crearFila('Fecha Registro', tarea.fecha_registro));

    // 3. Importancia (Badge)
    const badgePrioridad = document.createElement('span');
    const prioridadClase = tarea.prioridad ? tarea.prioridad.toLowerCase() : 'baja';
    badgePrioridad.classList.add('priority-tag', prioridadClase);
    badgePrioridad.textContent = (tarea.prioridad || 'BAJA').toUpperCase();
    card.appendChild(crearFilaConElemento('Importancia', badgePrioridad));

    // 4. Estado
    card.appendChild(crearFila('Estado', tarea.estado));

    // 5. Botones de Acción (Sin innerHTML)
    const acciones = document.createElement('div');
    acciones.classList.add('task-card__actions'); 
    // Usamos clases CSS en lugar de estilos inline para mantener el diseño
    acciones.style.display = 'flex';
    acciones.style.gap = '10px';
    acciones.style.marginTop = '15px';

    const btnEditar = document.createElement('button');
    btnEditar.classList.add('btn', 'btn--secondary', 'btn-editar');
    btnEditar.dataset.id = tarea.id;
    btnEditar.textContent = 'Editar';

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn', 'btn--danger', 'btn-eliminar');
    btnEliminar.dataset.id = tarea.id;
    btnEliminar.textContent = 'Eliminar';

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);
    card.appendChild(acciones);

    return card;
};