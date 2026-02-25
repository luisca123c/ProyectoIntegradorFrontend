// Funciones auxiliares para construir la estructura de la card
const crearFila = (label, value) => {
    const div = document.createElement('div');
    div.classList.add('task-card__row');
    div.innerHTML = `<span class="task-card__label">${label}:</span><span class="task-card__value">${value}</span>`;
    return div;
};

const crearFilaConElemento = (label, elemento) => {
    const div = document.createElement('div');
    div.classList.add('task-card__row');
    div.innerHTML = `<span class="task-card__label">${label}:</span>`;
    const valSpan = document.createElement('span');
    valSpan.classList.add('task-card__value');
    valSpan.appendChild(elemento);
    div.appendChild(valSpan);
    return div;
};

export const crearCardTarea = (tarea) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));

    const badgePrioridad = document.createElement('span');
    badgePrioridad.classList.add('priority-tag', tarea.prioridad.toLowerCase());
    badgePrioridad.textContent = tarea.prioridad.toUpperCase();
    card.appendChild(crearFilaConElemento('Importancia', badgePrioridad));

    card.appendChild(crearFila('Estado', tarea.estado));
    
    const acciones = document.createElement('div');
    acciones.style.display = 'flex';
    acciones.style.gap = '10px';
    acciones.style.marginTop = '15px';

    acciones.innerHTML = `
        <button class="btn btn--secondary btn-editar" data-id="${tarea.id}">Editar</button>
        <button class="btn btn--danger btn-eliminar" data-id="${tarea.id}">Eliminar</button>
    `;
    
    card.appendChild(acciones);
    return card;
}