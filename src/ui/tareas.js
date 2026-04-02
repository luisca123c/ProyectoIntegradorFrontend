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


// Si la tarea está Completada muestra un badge en lugar del select
export const crearCardTarea = (tarea, usuarios = []) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));
    card.appendChild(crearFila('Fecha Registro', tarea.fecha_registro));
    card.appendChild(crearFila('Última modificación', tarea.fecha_actualizacion));
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
        badge.textContent = ' Tarea completada';
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


export const crearCardTareaAdmin = (tarea, usuarios = []) => {
    const card = document.createElement('div');
    card.classList.add('card', 'task-card');
    card.dataset.id = tarea.id;

    card.appendChild(crearFila('Título', tarea.titulo));
    card.appendChild(crearFila('Descripción', tarea.descripcion));
    card.appendChild(crearFila('Fecha Registro', tarea.fecha_registro));
    card.appendChild(crearFila('Última modificación', tarea.fecha_actualizacion));
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
        badge.textContent = ' Tarea completada';
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