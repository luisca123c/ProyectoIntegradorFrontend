export const editarTarea = async(id, datos) => {
  const solicitud = await fetch(`http://localhost:3001/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  const respuesta = await solicitud.json();
  return respuesta;
};
