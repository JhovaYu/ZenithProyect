import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import config from '../config/config';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

interface UserAttributes {
  id?: number;
  nombre: string;
  apellido: string;
  matricula: string;
  email: string;
  password: string;
  rol: 'admin' | 'teacher' | 'student';
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public nombre!: string;
  public apellido!: string;
  public matricula!: string;
  public email!: string;
  public password!: string;
  public rol!: 'admin' | 'teacher' | 'student';
}

User.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matricula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin', 'teacher', 'student'),
    allowNull: false,
    defaultValue: 'student'
  }
}, {
  sequelize,
  modelName: 'users'
});

async function createAdmin(): Promise<void> {
  try {
    const adminExists = await User.findOne({ where: { rol: 'admin' } });
    if (adminExists) {
      console.log('Un administrador ya existe.');
      return;
    }

    const hashedPassword = await bcrypt.hash('#Sincodigo1', 10);
    await User.create({
      nombre: 'Jhovanny',
      apellido: 'Yuca Hernandez',
      matricula: '100017783',
      email: 'yuca.jhovanny2@gmail.com',
      password: hashedPassword,
      rol: 'admin'
    });

    console.log('Administrador creado con éxito.');
  } catch (error) {
    console.error('Error al crear el administrador:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();