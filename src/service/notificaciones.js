
const DURACION_MS = 3500;

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


function notificar(mensaje, tipo, duracion = DURACION_MS) {
    const iconos = { exito: '✅', error: '❌', info: 'ℹ️' };
    const contenedor = obtenerContenedor();

    const noti = document.createElement('div');
    noti.className = `notificacion notificacion--${tipo}`;
    noti.setAttribute('role', 'alert');
    // Poner esto:
    const icono = document.createElement('span');
    icono.classList.add('notificacion__icono');
    icono.setAttribute('aria-hidden', 'true');
    icono.textContent = iconos[tipo] ?? '🔔';

    const texto = document.createElement('span');
    texto.classList.add('notificacion__mensaje');
    texto.textContent = mensaje;

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('notificacion__cerrar');
    btnCerrar.setAttribute('aria-label', 'Cerrar notificación');
    btnCerrar.textContent = '×';

    noti.appendChild(icono);
    noti.appendChild(texto);    
    noti.appendChild(btnCerrar);

    const cerrar = () => {
        noti.classList.add('notificacion--saliendo');
        noti.addEventListener('animationend', () => noti.remove(), { once: true });
    };

    btnCerrar.addEventListener('click', cerrar);

    const timerId = setTimeout(cerrar, duracion);

    // Si el usuario cierra manualmente, cancelamos el timer para evitar doble ejecución
    noti.querySelector('.notificacion__cerrar').addEventListener('click', () => clearTimeout(timerId), { once: true });

    contenedor.appendChild(noti);
}

// --- Atajos exportados ---
export const notificarExito = (mensaje) => notificar(mensaje, 'exito');
export const notificarError = (mensaje) => notificar(mensaje, 'error');
export const notificarInfo = (mensaje) => notificar(mensaje, 'info');
