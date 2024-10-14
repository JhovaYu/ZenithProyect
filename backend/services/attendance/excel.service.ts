import * as ExcelJS from 'exceljs';
import { ClaseModel } from '../../models/clase.model';
import { AttendanceModel, AttendanceInstance } from '../../models/attendance.model';
import { UserModel } from '../../models/user.model';
import { sequelize, User, Clase, Attendance } from '../../server';



export async function generateAttendanceReport(claseId: number, date: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Asistencia');

  worksheet.addRow(['Nombre Completo', 'Matrícula', 'Correo', 'Equipo']);

  try {
    const asistencias = await Attendance.findAll({
      where: {
        claseId: claseId,
        date: date
      },
      include: [{
        model: User,
        attributes: ['nombre', 'apellido', 'matricula', 'email']
      }]
    });

    asistencias.forEach((asistencia: AttendanceInstance) => {
      if(asistencia.User) {
      const estudiante = asistencia.User ;
      worksheet.addRow([
        estudiante.nombre + ' ' + estudiante.apellido,
        estudiante.matricula,
        estudiante.email,
        asistencia.equipo,
      ]);
      } else {
        console.log('Estudiante no encontrado');
      }
    });
  

    return await workbook.xlsx.writeBuffer() as Buffer;
  } catch (error) {
    console.error('Error al generar el informe de asistencia:', error);
    throw error;
  }
}