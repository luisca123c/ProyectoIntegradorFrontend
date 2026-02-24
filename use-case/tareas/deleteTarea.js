export const eliminarTarea = async(id) => {
  const solicitud = await fetch(`http://localhost:3001/tasks/${id}`, {
    method: 'DELETE',
  });
  if (solicitud.ok) {
    return true
  } else {
    return false
  }
};