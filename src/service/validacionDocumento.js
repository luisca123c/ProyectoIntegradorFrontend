export const validar = (form, reglas) => {
    console.log(form);

    const errores = [];
    let valido = true;
    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];
        let { esvalido, mensaje } = validarCampoTipoNumber(campo, regla);
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



const validarCampoTipoNumber = (elemento, regla) => {
    if (regla.required && elemento.value.trim() == "") {
        return {
            esvalido: false,
            mensaje: regla.mensaje
        }
    }
    if (regla.required && regla.typeof && regla.typeof != elemento.type) {
        return {
            esvalido: false,
            mensaje: "El campo debe ser tipo " + regla.typeof
        }
    }
    return {
        esvalido: true
    }
}
