export const validar = (form, reglas) => {
    const errores = [];
    let valido = true;
    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];
        let { esvalido, mensaje } = validarCampo(campo, regla);
        valido = esvalido;
        if (!esvalido) {
            errores[name] = mensaje;
        }
    }
    if (Object.keys(errores).length != 0) {
        valido = false;
    }
    return { valido, errores }
}

// NUEVA — valida y marca/limpia la UI en tiempo real
export const validarConUI = (form, reglas) => {
    let valido = true;
    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];
        const spanError = document.getElementById(`error${capitalize(name)}`);
        const { esvalido, mensaje } = validarCampo(campo, regla);

        if (!esvalido) {
            valido = false;
            campo.classList.add('error');
            if (spanError) spanError.textContent = mensaje;
        } else {
            campo.classList.remove('error');
            if (spanError) spanError.textContent = '';
        }

        // Limpiar el error mientras el usuario escribe (se registra una sola vez)
        if (!campo._validacionListenerAdded) {
            campo.addEventListener('input', () => {
                if (campo.value.trim() !== '') {
                    campo.classList.remove('error');
                    if (spanError) spanError.textContent = '';
                }
            });
            campo._validacionListenerAdded = true;
        }
    }
    return { valido };
}

// NUEVA — limpia bordes y mensajes al hacer reset del form
export const limpiarErrores = (form, reglas) => {
    for (const name in reglas) {
        const campo = form.elements[name];
        const spanError = document.getElementById(`error${capitalize(name)}`);
        if (campo) campo.classList.remove('error');
        if (spanError) spanError.textContent = '';
    }
}

// Versión mejorada con validación de email
const validarCampo = (elemento, regla) => {
    if (!elemento) return { esvalido: true };
    if (regla.required && elemento.value.trim() === '') {
        return { esvalido: false, mensaje: regla.mensaje }
    }
    if (regla.typeof === 'email' && elemento.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(elemento.value.trim())) {
            return { esvalido: false, mensaje: 'Ingresa un correo válido' }
        }
    }
    return { esvalido: true }
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
