// Filtra el arreglo de tareas según estado y/o userId
// Retorna un nuevo arreglo sin modificar el original
export function filtrarTareas(tareas, estado, userId) {
    return tareas.filter(tarea => {
        const coincideEstado = estado === 'all' || tarea.estado === estado;
        const coincideUsuario = !userId || String(tarea.userId) === String(userId);
        return coincideEstado && coincideUsuario;
    });
}

// Crea el select de estado con sus opciones y lo retorna
function crearSelectEstado() {
    const grupo = document.createElement('div');
    grupo.classList.add('filtros__grupo');

    const label = document.createElement('label');
    label.classList.add('form__label');
    label.textContent = 'Estado';

    const select = document.createElement('select');
    select.id = 'filtroEstado';
    select.classList.add('form__input', 'form__input--sm');

    const opciones = [
        { value: 'all', texto: 'Todos' },
        { value: 'Pendiente', texto: 'Pendiente' },
        { value: 'En Progreso', texto: 'En Progreso' },
        { value: 'Completada', texto: 'Completada' },
    ];

    opciones.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.texto;
        select.appendChild(option);
    });

    grupo.appendChild(label);
    grupo.appendChild(select);
    return grupo;
}

// Crea el input de filtro por usuario y lo retorna
function crearInputUsuario() {
    const grupo = document.createElement('div');
    grupo.classList.add('filtros__grupo');

    const label = document.createElement('label');
    label.classList.add('form__label');
    label.textContent = 'Filtrar por ID Usuario';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'filtroUser';
    input.classList.add('form__input', 'form__input--sm');
    input.placeholder = 'Ej: 1';

    grupo.appendChild(label);
    grupo.appendChild(input);
    return grupo;
}

// Crea el botón de limpiar filtros y lo retorna
function crearBotonLimpiar() {
    const btn = document.createElement('button');
    btn.id = 'btnLimpiarFiltros';
    btn.classList.add('btn', 'btn--secondary', 'btn--sm');

    const span = document.createElement('span');
    span.classList.add('btn__text');
    span.textContent = 'Limpiar';

    btn.appendChild(span);
    return btn;
}

// Construye los controles de filtrado en el contenedor recibido
// Cada vez que cambia un control ejecuta el filtrado y notifica el resultado
export function inicializarFiltros(contenedor, onFilter, getTareasActuales) {

    const renderizarInterfaz = () => {
        contenedor.innerHTML = '';

        const grupoEstado = crearSelectEstado();
        const grupoUsuario = crearInputUsuario();
        const btnLimpiar = crearBotonLimpiar();

        contenedor.appendChild(grupoEstado);
        contenedor.appendChild(grupoUsuario);
        contenedor.appendChild(btnLimpiar);

        const selectEstado = contenedor.querySelector('#filtroEstado');
        const inputUser = contenedor.querySelector('#filtroUser');

        // Aplica los filtros activos y notifica el resultado
        const ejecutarFiltrado = () => {
            const tareasFiltradas = filtrarTareas(
                getTareasActuales(),
                selectEstado.value,
                inputUser.value
            );
            onFilter(tareasFiltradas);
        };

        selectEstado.addEventListener('change', ejecutarFiltrado);
        inputUser.addEventListener('input', ejecutarFiltrado);

        btnLimpiar.addEventListener('click', () => {
            selectEstado.value = 'all';
            inputUser.value = '';
            onFilter(getTareasActuales());
        });
    };

    const chequearYActivar = () => {
        if (contenedor.querySelector('.filtros__placeholder')) {
            renderizarInterfaz();
        }
    };

    return { chequearYActivar };
}