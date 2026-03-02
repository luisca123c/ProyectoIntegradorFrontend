/**
 * Envía una nueva tarea al servidor (POST)
 * @param {Object} nuevaTarea - Objeto con los datos de la tarea a crear
 * @returns {Promise<Object|null>} - La tarea creada o null si hubo error
 */
export async function postTarea(api_url, nuevaTarea) {
    try {
        const response = await fetch(`${api_url}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });

        if (!response.ok) {
            throw new Error("Error al guardar la tarea en el servidor");
        }

        const tareaCreada = await response.json();
        console.log("Tarea guardada correctamente:", tareaCreada);
        return tareaCreada;

    } catch (error) {
        console.error("Error en postTarea:", error);
        return null;
    }
}
