export const getUsuario = async (api_url, id) => {
    const res = await fetch(`${api_url}/users/${id}`);
    if (!res.ok) throw new Error('Usuario no encontrado');
    return res.json();
};

export const getUsuarios = async (api_url) => {
    const res = await fetch(`${api_url}/users`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
};

export const crearUsuario = async (api_url, datos) => {
    const res = await fetch(`${api_url}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, activo: true })
    });
    if (!res.ok) throw new Error('Error al crear usuario');
    return res.json();
};

export const editarUsuario = async (api_url, id, datos) => {
    const res = await fetch(`${api_url}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    return res.json();
};

export const eliminarUsuario = async (api_url, id) => {
    const res = await fetch(`${api_url}/users/${id}`, { method: 'DELETE' });
    return res.ok;
};

export const toggleActivoUsuario = async (api_url, id, activo) => {
    const res = await fetch(`${api_url}/users/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: activo })
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    return res.json();
};