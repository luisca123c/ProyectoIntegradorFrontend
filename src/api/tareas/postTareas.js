/**
 * Crea una tarea y luego asigna los usuarios indicados.
 * @param {string} api_url - URL base del API
 * @param {Object} nuevaTarea - Debe incluir: titulo, descripcion, estado, prioridad, y userIds (array)
 * @returns {Promise<Object|null>} - La tarea creada o null si hubo error
 */
export async function postTarea(api_url, nuevaTarea) {
    try {
        const { titulo, descripcion, estado, prioridad, userIds = [] } = nuevaTarea;

        // Paso 1: crear la tarea
        const response = await fetch(`${api_url}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descripcion, estado, prioridad })
        });

        if (!response.ok) throw new Error("Error al guardar la tarea en el servidor");

        const tareaCreada = await response.json();
        const taskId = tareaCreada.data?.id;

        // Paso 2: asignar cada usuario a la tarea
        for (const userid of userIds) {
            await fetch(`${api_url}/tasks/${taskId}/assing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid })
            });
        }

        console.log("Tarea guardada y usuarios asignados:", tareaCreada);
        return tareaCreada;

    } catch (error) {
        console.error("Error en postTarea:", error);
        return null;
    }
}
