# Usa la imagen oficial de Node.js como base
FROM node:20.14.0

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expón el puerto 3000 en el contenedor
EXPOSE 3000

# Define el comando por defecto para ejecutar la aplicación
CMD ["node", "index.js"]