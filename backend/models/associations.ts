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

  const models = { User, Clase, Attendance };

  // Inicializa asociaciones (si algún modelo tiene una función 'associate')
  Object.values(models).forEach((model: any) => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return { models, User, Clase, Attendance };
}