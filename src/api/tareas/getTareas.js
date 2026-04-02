export async function getTareas(api_url, userId) {
    try {
        const response = await fetch(`${api_url}/users/${userId}/tasks`);
        if (!response.ok) throw new Error("Error al conectar con el servidor de tareas");
        const data = await response.json();
        return data.data ?? [];
    } catch (error) {
        console.error("Error en getTareas:", error);
        return [];
    }
}

export async function getTodasLasTareas(api_url) {
    try {
        const response = await fetch(`${api_url}/tasks`);
        if (!response.ok) throw new Error("Error al obtener todas las tareas");
        const result = await response.json();
        return result.data ?? [];
    } catch (error) {
        console.error("Error en getTodasLasTareas:", error);
        return [];
    }
}