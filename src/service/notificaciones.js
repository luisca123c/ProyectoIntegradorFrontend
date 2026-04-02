import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
});

export const notificarExito = (mensaje) =>
    Toast.fire({ icon: 'success', title: mensaje });

export const notificarError = (mensaje) =>
    Toast.fire({ icon: 'error', title: mensaje });

export const notificarInfo = (mensaje) =>
    Toast.fire({ icon: 'info', title: mensaje });

export const confirmar = (mensaje) =>
    Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(result => result.isConfirmed);
