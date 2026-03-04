// RF03 – Módulo de Notificaciones
// No importa nada de otros módulos del proyecto → cero riesgo de dependencias circulares (RNF05)

const DURACION_MS = 3500;

/**
 * Obtiene (o crea) el contenedor de notificaciones en el DOM.
 * @returns {HTMLElement}
 */
function obtenerContenedor() {
    let contenedor = document.getElementById('notificaciones-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notificaciones-contenedor';
        contenedor.setAttribute('aria-live', 'polite');
        contenedor.setAttribute('aria-atomic', 'false');
        document.body.appendChild(contenedor);
    }
    return contenedor;
}

/**
 * Muestra una notificación en pantalla.
 * @param {string} mensaje  - Texto de la notificación.
 * @param {'exito'|'error'|'info'} tipo - Variante visual.
 * @param {number} [duracion=DURACION_MS] - Tiempo en ms antes del auto-cierre.
 */
function notificar(mensaje, tipo, duracion = DURACION_MS) {
    const iconos = { exito: '✅', error: '❌', info: 'ℹ️' };
    const contenedor = obtenerContenedor();

    const noti = document.createElement('div');
    noti.className = `notificacion notificacion--${tipo}`;
    noti.setAttribute('role', 'alert');
    noti.innerHTML = `
        <span class="notificacion__icono" aria-hidden="true">${iconos[tipo] ?? '🔔'}</span>
        <span class="notificacion__mensaje">${mensaje}</span>
        <button class="notificacion__cerrar" aria-label="Cerrar notificación">×</button>
    `;

    const cerrar = () => {
        noti.classList.add('notificacion--saliendo');
        noti.addEventListener('animationend', () => noti.remove(), { once: true });
    };

    noti.querySelector('.notificacion__cerrar').addEventListener('click', cerrar);

    const timerId = setTimeout(cerrar, duracion);

    // Si el usuario cierra manualmente, cancelamos el timer para evitar doble ejecución
    noti.querySelector('.notificacion__cerrar').addEventListener('click', () => clearTimeout(timerId), { once: true });

    contenedor.appendChild(noti);
}

// --- Atajos exportados ---
export const notificarExito = (mensaje) => notificar(mensaje, 'exito');
export const notificarError = (mensaje) => notificar(mensaje, 'error');
export const notificarInfo = (mensaje) => notificar(mensaje, 'info');
