import { Model, DataTypes, Sequelize } from 'sequelize';

interface UserAttributes {
    id?: number;
    nombre: string;
    apellido: string;
    matricula?: string;
    email: string;
    password: string;
    rol: 'admin' | 'teacher' | 'student';
  }

  interface CreateUserAttributes {
    nombre: string;
    apellido: string;
    matricula?: string;
    email: string;
    password: string;
    rol: 'admin' | 'teacher' | 'student';
}
  
  interface UserInstance extends Model<UserAttributes>, UserAttributes {
  }



  const UserModel = (sequelize: Sequelize) => {
    const User = sequelize.define<UserInstance>('users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
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
        allowNull: true,
        unique: true
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
    });

    return User;
  };
  
  export { UserModel, UserInstance, UserAttributes, CreateUserAttributes };