/**
 * Obtiene las tareas de un usuario específico desde el servidor
 * Trae todas las tareas y filtra en el cliente por userId
 * @param {string} userId - El documento del usuario
 * @returns {Promise<Array>} - Lista de tareas del usuario
 */
export async function getTareas(api_url, userId) {
    try {
        // Traemos TODAS las tareas del servidor
        const response = await fetch(`${api_url}/tasks`);

        if (!response.ok) {
            throw new Error("Error al conectar con el servidor de tareas");
        }

        const todasLasTareas = await response.json();

        // Filtramos en el cliente por userId (más confiable que el query param)
        const tareas = todasLasTareas.filter(tarea => tarea.userId === userId);

        console.log(`Tareas encontradas para ${userId}:`, tareas);
        return tareas;

    } catch (error) {
        console.error("Error en getTareas:", error);
        return [];
    }
}
