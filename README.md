# Manual de Usuario — Project Icarus

## 1. Introducción

Project Icarus es una aplicación web que permite jugar de forma digital a un juego de mesa de exploración espacial. Los usuarios pueden registrarse, iniciar sesión, crear partidas, invitar a otros jugadores mediante un código y participar en una partida compartida.

Este manual describe los pasos necesarios para instalar y ejecutar la aplicación en un entorno local, así como las principales funcionalidades disponibles para los jugadores.

## 2. Requisitos previos

Para ejecutar el proyecto en local es necesario disponer de las siguientes herramientas:

- **Node.js:** entorno de ejecución de JavaScript.
- **pnpm:** gestor de paquetes utilizado por el proyecto.
- **Docker y Docker Compose:** necesarios para ejecutar la base de datos.
- **Git:** para descargar el repositorio.

Se recomienda utilizar una versión reciente de Node.js compatible con las dependencias del proyecto.

## 3. Instalación del proyecto

### 3.1. Clonar el repositorio

En primer lugar, se debe descargar el código fuente desde GitHub:

```bash
git clone https://github.com/Miguelgarviz/proyect_icarus.git
```

A continuación, acceder al directorio del proyecto:

```bash
cd proyect_icarus
```

### 3.2. Instalar las dependencias

El proyecto utiliza pnpm como gestor de paquetes y está organizado como un monorepositorio.

Desde la raíz del proyecto, ejecutar:

```bash
pnpm install
```

Este comando instalará las dependencias necesarias para el frontend y el backend.

## 4. Configuración del entorno

El repositorio incluye archivos `.env.example` que contienen las variables de entorno necesarias para ejecutar la aplicación.

Estos archivos sirven como plantillas. Antes de iniciar los servicios, se deben copiar y renombrar a `.env`.

### 4.1. Crear los archivos de configuración

Desde la raíz del proyecto, ejecutar los siguientes comandos:

**Windows (PowerShell):**

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env
```

**Linux o macOS:**

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Una vez creados, se deben editar los archivos `.env` correspondientes y comprobar que los valores se ajustan al entorno local.

### 4.2. Configuración del backend

El archivo `apps/backend/.env` contiene la configuración del servidor y de la base de datos.

Se deben revisar especialmente las siguientes variables:

- `DATABASE_URL`: dirección de conexión a la base de datos principal.
- `DATABASE_TEST_URL`: dirección de conexión a la base de datos utilizada para pruebas.
- `JWT_SECRET`: clave utilizada para la autenticación mediante tokens.
- `FRONTEND_URL`: dirección desde la que se ejecuta el frontend, utilizada para configurar CORS.

Para una ejecución local, las direcciones deben corresponder con los puertos configurados en Docker y con la dirección del frontend.

### 4.3. Configuración del frontend

El archivo `apps/frontend/.env` contiene las variables necesarias para que el frontend se comunique con el backend.

La variable principal es:

- `NEXT_PUBLIC_BACKEND_URL`: dirección base del backend.

En el entorno local, su valor debe apuntar al servidor backend ejecutado en `http://localhost:4000`.

**Importante:** los archivos `.env` contienen configuración local y posibles credenciales. No deben compartirse ni subirse al repositorio. Los archivos `.env.example` deben utilizarse como plantillas, sustituyendo los valores de ejemplo por los correspondientes al entorno de ejecución.

## 5. Preparación de la base de datos

Project Icarus utiliza PostgreSQL con Prisma para la gestión de los datos.

### 5.1. Iniciar Docker

Con Docker Desktop o el servicio Docker en funcionamiento, ejecutar desde la raíz del proyecto:

```bash
docker compose up -d
```

Este comando inicia los servicios definidos en el archivo `docker-compose.yml`.

Para comprobar que los contenedores están en ejecución:

```bash
docker compose ps
```

### 5.2. Generar el cliente de Prisma

Antes de iniciar el backend, es necesario generar el cliente de Prisma:

```bash
pnpm --filter backend db:generate
```

### 5.3. Aplicar las migraciones

Para crear o actualizar la estructura de la base de datos, ejecutar:

```bash
pnpm --filter backend db:migrate
```

Este comando aplica las migraciones pendientes sobre la base de datos configurada en `DATABASE_URL`.

## 6. Ejecución de la aplicación

La aplicación está dividida en dos servicios independientes: frontend y backend. Ambos deben estar ejecutándose para poder utilizar todas las funcionalidades.

### 6.1. Iniciar el backend

Abrir una terminal en la raíz del proyecto y ejecutar:

```bash
pnpm --filter backend dev
```

El servidor backend estará disponible, por defecto, en:

```text
http://localhost:4000
```

La documentación de la API puede consultarse en:

```text
http://localhost:4000/docs
```

### 6.2. Iniciar el frontend

Abrir una segunda terminal, también en la raíz del proyecto, y ejecutar:

```bash
pnpm --filter frontend dev
```

El frontend estará disponible en:

```text
http://localhost:3000
```

Acceder a esa dirección desde un navegador web para comenzar a utilizar Project Icarus.

## 7. Uso de la aplicación

### 7.1. Registro de usuario

Al acceder a la aplicación, el usuario debe registrarse si todavía no dispone de una cuenta.

Para ello, deberá introducir los datos solicitados en el formulario de registro.

Una vez completado el registro, podrá iniciar sesión con sus credenciales.

### 7.2. Inicio de sesión

Los usuarios registrados pueden acceder a la aplicación introduciendo su nombre de usuario y contraseña.

Tras autenticarse correctamente, se accederá a la pantalla principal.

La aplicación utiliza tokens JWT para gestionar la autenticación de las peticiones al backend.

### 7.3. Pantalla principal

Desde la pantalla principal se puede acceder a las funcionalidades relacionadas con las partidas.

El usuario puede crear una nueva partida o incorporarse a una existente utilizando el código proporcionado por su anfitrión.

### 7.4. Crear una partida

Para crear una partida, el usuario debe utilizar la opción correspondiente en la pantalla principal.

El creador de la partida adquiere el rol de anfitrión y puede gestionar la configuración de la sala.

La partida dispone de un código identificador que permite que otros usuarios se unan a ella.

### 7.5. Unirse a una partida

Para incorporarse a una partida existente, el usuario debe introducir el código de la sala a la que desea acceder.

Una vez validado, pasará a formar parte de la sala y aparecerá en la lista de jugadores.

### 7.6. Sala de espera

En la sala de espera se muestran los jugadores que forman parte de la partida y las opciones de configuración disponibles.

El anfitrión puede modificar la configuración de la partida, gestionar a los jugadores e iniciar la partida cuando se cumplan las condiciones necesarias.

Los demás participantes pueden consultar la información de la sala y esperar al inicio de la partida.

### 7.7. Desarrollo de la partida

Una vez iniciada la partida, los jugadores acceden al tablero de juego.

Durante su turno, cada jugador puede realizar las acciones permitidas por las reglas del juego, entre ellas:

- Desplazarse por el tablero.
- Explorar y excavar en las distintas localizaciones.
- Obtener y gestionar recursos.
- Utilizar cartas y sus efectos.
- Reparar y mejorar su nave.
- Interactuar con estaciones y comercios.
- Gestionar el almacenamiento y los recursos disponibles.

Las acciones están sujetas a las reglas y restricciones de la partida, como los puntos de movimiento, los recursos disponibles y el estado de la nave.

### 7.8. Sincronización entre jugadores

Project Icarus incorpora comunicación en tiempo real mediante WebSockets.

Cuando un jugador realiza una acción que afecta a la información visible de los demás participantes, estos reciben una notificación para actualizar los datos correspondientes.

De esta forma, los jugadores pueden mantener una visión sincronizada del estado de la partida sin necesidad de actualizar manualmente el navegador.

### 7.9. Finalización de la partida

La partida puede finalizar cuando se alcanza una de las condiciones de victoria o derrota establecidas por las reglas del juego.

Al producirse el final, la aplicación informa a los participantes del resultado y permite regresar a la pantalla principal.

## 8. Resolución de problemas frecuentes

### La aplicación no puede conectarse al backend

Comprobar que:

- El backend está ejecutándose.
- `NEXT_PUBLIC_BACKEND_URL` contiene la dirección correcta.
- El puerto configurado coincide con el utilizado por el servidor.

### Error de conexión con la base de datos

Comprobar que:

- Docker está iniciado.
- Los contenedores de la base de datos están en ejecución.
- `DATABASE_URL` contiene los datos de conexión correctos.
- Se han aplicado las migraciones.

### Error relacionado con Prisma

Ejecutar desde la raíz del proyecto:

```bash
pnpm --filter backend db:generate
```

Si el problema está relacionado con la estructura de la base de datos, comprobar también que las migraciones se han aplicado correctamente.

### El frontend no carga correctamente

Comprobar que el backend está disponible y que la variable `NEXT_PUBLIC_BACKEND_URL` está correctamente configurada.

Si se modifica una variable de entorno del frontend, reiniciar el servidor de desarrollo para que los cambios sean cargados.

## 9. Acceso a la versión desplegada

Además de la ejecución local, Project Icarus dispone de una versión desplegada públicamente.

Esta versión permite acceder a la aplicación desde un navegador sin necesidad de instalar el proyecto ni configurar un entorno local.

La dirección de acceso es:

**[Dirección Publica del Frontend](https://proyect-icarus-frontend.vercel.app)**

**[Dirección Publica del Backend](https://proyect-icarus-backend.onrender.com)**

La versión desplegada utiliza Vercel para el frontend, Render para el backend y Neon como servicio de base de datos.

Debido a las limitaciones de los planes gratuitos utilizados, el primer acceso o una petición después de un periodo de inactividad puede experimentar un tiempo de espera superior al habitual.