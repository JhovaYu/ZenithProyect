// Generar el archivo environment.prod.ts
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Cargar las variables de entorno del archivo .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Contenido del archivo environment.prod.ts
const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'https://default-api.com'}',
  // Puedes agregar más variables aquí según sea necesario
};
`;

// Escribir el contenido en el archivo environment.prod.ts
fs.writeFileSync(path.resolve(__dirname, 'src/environments/environment.prod.ts'), content);
console.log('Archivo environment.prod.ts generado con éxito.');