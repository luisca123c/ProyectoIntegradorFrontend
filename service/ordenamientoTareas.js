/**
 * RF02 – Ordenamiento Dinámico de Tareas
 */
export function inicializarOrdenamiento(contenedor, alOrdenar, obtenerTareas) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const divControls = document.createElement('div');
    divControls.className = 'orden-group'; // Clase para manejar el flexbox en CSS

    const selectCriterio = document.createElement('select');
    selectCriterio.id = 'selectCriterio';
    selectCriterio.className = 'form__input';

    const opciones = [
        { val: 'nombre', text: 'Por Nombre' },
        { val: 'fecha', text: 'Por Fecha' },
        { val: 'estado', text: 'Por Estado' },
        { val: 'prioridad', text: 'Por Importancia' }
    ];

    opciones.forEach(opt => {
        const elOpt = document.createElement('option');
        elOpt.value = opt.val;
        elOpt.textContent = opt.text;
        selectCriterio.appendChild(elOpt);
    });

    const btnDireccion = document.createElement('button');
    btnDireccion.id = 'btnDireccion';
    btnDireccion.className = 'btn btn--secondary btn--orden';
    btnDireccion.dataset.asc = "true";
    btnDireccion.textContent = "Ascendente ↑";

    divControls.appendChild(selectCriterio);
    divControls.appendChild(btnDireccion);
    contenedor.appendChild(divControls);

    const ejecutarCambio = () => {
        const tareas = obtenerTareas();
        if (!tareas || tareas.length === 0) return;
        
        const criterio = selectCriterio.value;
        const esAscendente = btnDireccion.dataset.asc === "true";
        alOrdenar(ordenarTareas(tareas, criterio, esAscendente));
    };

    selectCriterio.addEventListener('change', ejecutarCambio);
    btnDireccion.addEventListener('click', () => {
        const esAsc = btnDireccion.dataset.asc === "true";
        btnDireccion.dataset.asc = String(!esAsc);
        btnDireccion.textContent = !esAsc ? "Ascendente ↑" : "Descendente ↓";
        ejecutarCambio();
    });
}

function ordenarTareas(tareas, criterio, ascendente) {
    const direccion = ascendente ? 1 : -1;
    const ordenEstados = { "Pendiente": 1, "En Progreso": 2, "Completada": 3 };
    const ordenPrioridad = { "Baja": 1, "Media": 2, "Alta": 3 };

    return [...tareas].sort((a, b) => {
        let comparacion = 0;
        switch (criterio) {
            case 'nombre':
                comparacion = (a.titulo || "").localeCompare(b.titulo || "", 'es');
                break;
            case 'fecha':
                const fA = a.fecha_registro ? new Date(a.fecha_registro) : 0;
                const fB = b.fecha_registro ? new Date(b.fecha_registro) : 0;
                comparacion = fA - fB;
                break;
            case 'estado':
                comparacion = (ordenEstados[a.estado] || 0) - (ordenEstados[b.estado] || 0);
                break;
            case 'prioridad':
                comparacion = (ordenPrioridad[a.prioridad] || 0) - (ordenPrioridad[b.prioridad] || 0);
                break;
        }
        return comparacion * direccion;
    });
}