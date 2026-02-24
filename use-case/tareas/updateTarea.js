export const editarTarea = async(id) => {
  const solicitud = fetch(`http://localhost:3001/tasks/${id}`, {
    method: 'PUT',
  });
  const respuesta = (await solicitud).json();
  return respuesta;
}