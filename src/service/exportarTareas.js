// Convierte el arreglo de tareas a un Blob JSON listo para descargar
// Lógica de procesamiento pura, no accede al DOM
export function generarBlobJSON(tareas) {
    const json = JSON.stringify(tareas, null, 2);
    return new Blob([json], { type: 'application/json' });
}

// Genera un nombre de archivo con fecha y hora para evitar sobreescrituras
export function generarNombreArchivo() {
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 5).replace(':', '-');
    return `tareas_${fecha}_${hora}.json`;
}

// Crea un enlace temporal en el DOM, dispara la descarga y lo elimina
export function descargarBlob(blob, nombreArchivo) {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
}

// Orquesta la exportación: genera el blob, define el nombre y dispara la descarga
// Retorna un objeto con el resultado y la cantidad de tareas exportadas
export function exportarTareasJSON(tareasVisibles) {
    if (!tareasVisibles || tareasVisibles.length === 0) {
        return { exito: false, cantidad: 0 };
    }
    const blob = generarBlobJSON(tareasVisibles);
    const nombre = generarNombreArchivo();
    descargarBlob(blob, nombre);
    return { exito: true, cantidad: tareasVisibles.length };
}
