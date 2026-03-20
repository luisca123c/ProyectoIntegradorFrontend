# Frontend proyecto integrador

## Participantes

| Nombre | Rol |
| :--- | :--- |
| **Julián Andrés Diaz Chaparro** | Product Owner |
| **Luis Carlos Villamizar Sanchez** | Backend |
| **Carol Dayana Lizarazo Colmenares** | Frontend |
| **Josue Chaparro Oviedo** | Frontend |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado
- [npm](https://www.npmjs.com/) (viene incluido con Node.js)

## Instalación

Luego de clonar el repositorio, instala las dependencias:

```bash
npm install
```

## Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run start` | **Comando principal** — levanta Vite y json-server al mismo tiempo |
| `npm run dev` | Solo el servidor de desarrollo con Vite (sin datos) |
| `npm run server` | Solo json-server en `http://localhost:3001` (sin interfaz) |
| `npm run build` | Genera la carpeta `dist/` optimizada para producción |
| `npm run preview` | Previsualiza el build de producción localmente |

> Para ejecutar el proyecto completo usa siempre `npm run start`.
> La app estará disponible en `http://localhost:5173` y los datos en `http://localhost:3001`.

