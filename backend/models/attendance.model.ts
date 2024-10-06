import { Model, DataTypes, Sequelize, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from 'sequelize';
import { UserInstance } from './user.model';

interface AttendanceAttributes {
  id?: number;
  claseId: number;
  studentId: number;
  date: Date;
  presente: boolean;
  equipo: string;
}

interface AttendanceInstance extends Model<AttendanceAttributes>, AttendanceAttributes {
  User?: UserInstance;
}

const AttendanceModel = (sequelize: Sequelize) => {
  const Attendance = sequelize.define<AttendanceInstance>('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    claseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    presente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    equipo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });


  return Attendance;
};

export { AttendanceModel, AttendanceInstance, AttendanceAttributes };