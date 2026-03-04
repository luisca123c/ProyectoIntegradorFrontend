export const editarTarea = async (api_url,id, datos) => {
    const solicitud = await fetch(`${api_url}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    const respuesta = await solicitud.json();
    return respuesta;
};
