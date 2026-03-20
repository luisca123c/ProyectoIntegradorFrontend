export const api_url = "http://localhost:3001";

export const reglas_documento = {
    userDoc: { required: true, mensaje: "El campo no puede estar vacío", typeof: "text" },
};

export const reglas_tarea = {
    adminTaskTitulo: { required: true, mensaje: "El título es obligatorio",      typeof: "text"     },
    adminTaskDesc:   { required: true, mensaje: "La descripción es obligatoria", typeof: "textarea" },
};

export const reglas_usuario = {
    adminUserNombre: { required: true, mensaje: "El nombre es obligatorio", typeof: "text"  },
    adminUserCorreo: { required: true, mensaje: "El correo es obligatorio",  typeof: "email" },
};