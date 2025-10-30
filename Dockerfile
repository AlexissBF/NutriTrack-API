# Usa la imagen base de Node.js versión 20 (ligera)
FROM node:20-alpine

# Establece la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el código fuente restante (server.js, models)
COPY . .

# El puerto que Express usará dentro del contenedor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]