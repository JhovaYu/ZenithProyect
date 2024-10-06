// backend/models/clase.model.js
// Modelo de Clase para el backend (relacionado con src/app/models/clase.model.ts)

import { Model, DataTypes, Sequelize } from 'sequelize';

interface ClaseAttributes {
  id_clase?: number;
  nombre_clase: string;
  hora_inicio: Date;
  hora_fin: Date;
  dia_semana: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  periodicidad: string;
  duracion_semanas: number;
  aula: string;
  materia: string;
  nota?: string;
  profesorId: number;
}

interface ClaseInstance extends Model<ClaseAttributes>, ClaseAttributes {}

const ClaseModel = (sequelize: Sequelize) => {
    const Clase = sequelize.define<ClaseInstance>('clases', {
      id_clase: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_clase: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
      },
      dia_semana: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const rawValue = this.getDataValue('dia_semana');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value: string | string[]) {
          this.setDataValue('dia_semana', JSON.stringify(Array.isArray(value) ? value : [value]));
        }
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      periodicidad: {
        type: DataTypes.STRING,
        allowNull: false
      },
      duracion_semanas: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      aula: {
        type: DataTypes.STRING,
        allowNull: false
      },
      materia: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nota: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      profesorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
  
    return Clase;
  };
  
export { ClaseModel, ClaseInstance, ClaseAttributes };