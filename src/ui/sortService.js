export const ordenarTareas = (tareas, criterio) => {
    return [...tareas].sort((a, b) => {
        if (criterio === 'nombre') return a.titulo.localeCompare(b.titulo);
        if (criterio === 'estado') return a.estado.localeCompare(b.estado);
        if (criterio === 'fecha') return new Date(a.fecha_registro) - new Date(b.fecha_registro);
        return 0;
    });
};

// Lógica para Filtrado Combinado
export const filtrarTareas = (tareas, { estado, texto }) => {
    return tareas.filter(t => {
        const coincideEstado = estado === 'todos' || t.estado === estado;
        const coincideTexto = t.titulo.toLowerCase().includes(texto.toLowerCase());
        return coincideEstado && coincideTexto;
    });
};

