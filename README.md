# DataPulse Latam - Frontend (Angular)

Este repositorio contiene la Single Page Application (SPA) para DataPulse Latam. Consiste en un Dashboard interactivo que permite visualizar indicadores macroeconómicos, calcular niveles de riesgo mediante mapas interactivos y gestionar portafolios de inversión.

## 🚀 Tecnologías Principales
* Angular 16+
* Angular Material (Componentes UI)
* Chart.js (Gráficos interactivos)
* Leaflet / D3.js (Mapas interactivos)
* TypeScript

---

## 🛠️ Despliegue en Entorno Local (Desarrollo)

Sigue estos pasos para ejecutar la interfaz de usuario en tu máquina conectada al backend local.

### Requisitos previos
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
* Tener instalado Angular CLI globalmente (`npm install -g @angular/cli`).
* El **Backend** de DataPulse debe estar corriendo en el puerto 8000.

### Paso 1: Instalar dependencias
Abre tu terminal en la raíz de este proyecto y descarga los paquetes de Node:

```bash
npm install
```

### Paso 2: Configurar la URL del API
Verifica que el archivo `src/environments/environment.ts` (y `environment.development.ts` si existe) apunte correctamente a tu servidor local de Django:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### Paso 3: Levantar el servidor de desarrollo
Inicia la aplicación ejecutando:

```bash
ng serve --open
```

**¡Listo!** El comando abrirá automáticamente tu navegador en `http://localhost:4200/`. Cualquier cambio que hagas en el código fuente se recargará automáticamente.

---

## 🌍 Despliegue en Producción

Para compilar la aplicación y desplegarla en un servicio de hosting estático (como Vercel, Netlify, Firebase Hosting o AWS S3):

### Paso 1: Configurar el entorno productivo
Abre el archivo `src/environments/environment.ts` (o `environment.prod.ts` dependiendo de tu versión de Angular) y cambia la URL por el dominio real donde desplegaste tu backend:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.midominio.com/api' // <--- URL real de tu Backend productivo
};
```

### Paso 2: Generar el Build de Producción
Ejecuta el siguiente comando para que Angular compile y minimice todos los archivos (HTML, CSS y JS):

```bash
ng build
```
*(Esto generará una carpeta llamada `dist/` en la raíz de tu proyecto, que contiene los archivos que debes subir a tu hosting).*

### Paso 3: Configuración de Rutas (SPA Rules)
Como esto es una *Single Page Application*, las rutas son manejadas por Angular. Si un usuario recarga la página en una sub-ruta (ej. `/dashboard/paises`), el servidor web podría devolver un error 404. 
Debes configurar tu proveedor de hosting para que redirija todo el tráfico a `index.html`:

* **Vercel:** Crea un archivo `vercel.json` en la raíz con:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
* **Netlify:** Crea un archivo `_redirects` en la carpeta `src` con:
  ```text
  /*    /index.html    200
  ```