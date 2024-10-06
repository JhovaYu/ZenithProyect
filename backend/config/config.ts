export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port?: number;  // Añadimos la propiedad port como opcional
  dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  dialectOptions?: {
    ssl?: {
      rejectUnauthorized: boolean;
    };
  };
}

export interface AppConfig {
  [key: string]: DatabaseConfig;
  development: DatabaseConfig;
  test: DatabaseConfig;
  production: DatabaseConfig;
}

const config: AppConfig = {
  development: {
    username: "root",
    password: "#Sincodigo1",
    database: "mi_base_de_datos",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: "#Sincodigo1",
    database: "mi_base_de_datos",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env['MYSQLUSER'] || "",
    password: process.env['MYSQLPASSWORD'] || "",
    database: process.env['MYSQLDATABASE'] || "",
    host: process.env['MYSQLHOST'] || "",
    port: parseInt(process.env['MYSQLPORT'] || "3306"),
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
};

export default config;