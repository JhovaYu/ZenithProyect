import { Model, DataTypes, Sequelize, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, ModelAttributes, ModelStatic } from 'sequelize';
import { UserInstance, UserModel } from './user.model';

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
  getUser: BelongsToGetAssociationMixin<UserInstance>;
  setUser: BelongsToSetAssociationMixin<UserInstance, number>;
}

interface AttendanceModelStatic extends ModelStatic<AttendanceInstance> {
  associate?: (models: { User: ReturnType<typeof UserModel> }) => void;
}

const AttendanceModel = (sequelize: Sequelize): AttendanceModelStatic => {
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
  } as ModelAttributes<AttendanceInstance>);

  (Attendance as AttendanceModelStatic).associate = (models: { User: ReturnType<typeof UserModel> }) => {
    Attendance.belongsTo(models.User, { foreignKey: 'studentId' });
  };

  return Attendance as AttendanceModelStatic;
};

export { AttendanceModel, AttendanceInstance, AttendanceAttributes, AttendanceModelStatic };