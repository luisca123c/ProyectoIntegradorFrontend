export async function getTareas(api_url, userId) {
    try {
        const response = await fetch(`${api_url}/tasks`);
        if (!response.ok) throw new Error("Error al conectar con el servidor de tareas");
        const todasLasTareas = await response.json();

        // Soporta userIds[] (nuevo) y userId string (retrocompatibilidad)
        const tareas = todasLasTareas.filter(tarea => {
            if (Array.isArray(tarea.userIds)) {
                return tarea.userIds.includes(String(userId));
            }
            return String(tarea.userId) === String(userId);
        });

        return tareas;
    } catch (error) {
        console.error("Error en getTareas:", error);
        return [];
    }
}

export async function getTodasLasTareas(api_url) {
    try {
        const response = await fetch(`${api_url}/tasks`);
        if (!response.ok) throw new Error("Error al obtener todas las tareas");
        return await response.json();
    } catch (error) {
        console.error("Error en getTodasLasTareas:", error);
        return [];
    }
}