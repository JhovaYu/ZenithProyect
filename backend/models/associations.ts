import { sequelize } from '../server';
import { UserModel } from './user.model';
import { ClaseModel } from './clase.model';
import { AttendanceModel } from './attendance.model';

export function initializeAssociations() {
  const User = UserModel(sequelize);
  const Clase = ClaseModel(sequelize);
  const Attendance = AttendanceModel(sequelize);

  User.hasMany(Clase, { foreignKey: 'profesorId' });
  Clase.belongsTo(User, { foreignKey: 'profesorId' });

  User.hasMany(Attendance, { foreignKey: 'studentId' });
  Attendance.belongsTo(User, { foreignKey: 'studentId' });

  return { User, Clase, Attendance };
}