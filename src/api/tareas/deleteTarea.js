export const eliminarTarea = async (api_url, id) => {
    const solicitud = await fetch(`${api_url}/tasks/${id}`, {
        method: 'DELETE',
    });
    if (solicitud.ok) {
        return true
    } else {
        return false
    }
};
