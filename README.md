# Frontend — Proyecto Integrador

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
- El **backend** corriendo en `http://localhost:3000` (ver README del repositorio de backend)

---

## Instalación y puesta en marcha

### 1. Clonar y ubicarse en la rama correcta

```bash
git checkout main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

> El frontend consume la API del backend en `http://localhost:3000/api`. Asegúrate de que el backend esté corriendo antes de usar la aplicación.

---

## Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Vite |
| `npm run build` | Genera la carpeta `dist/` optimizada para producción |
| `npm run preview` | Previsualiza el build de producción localmente |

---

## Orden de arranque del proyecto completo

Para usar el proyecto es necesario tener **dos terminales abiertas**:

| Terminal | Repositorio | Comando |
| :--- | :--- | :--- |
| 1 | `backend` | `npm run dev` |
| 2 | `frontend` | `npm run dev` |
