import * as ExcelJS from 'exceljs';
import { ClaseModel } from '../../models/clase.model';
import { AttendanceModel, AttendanceInstance } from '../../models/attendance.model';
import { UserModel } from '../../models/user.model';
import { sequelize, User, Clase, Attendance } from '../../server';



export async function generateAttendanceReport(claseId: number, date: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Asistencia');

  worksheet.addRow(['Estudiante', 'Matrícula', 'Correo', 'Equipo']);

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
      worksheet.addRow([
        `${asistencia.User?.nombre || ''} ${asistencia.User?.apellido || ''}`,
        asistencia.User?.matricula || '',
        asistencia.User?.email || '',
        asistencia.equipo
      ]);
    });

    return await workbook.xlsx.writeBuffer() as Buffer;
  } catch (error) {
    console.error('Error al generar el informe de asistencia:', error);
    throw error;
  }
}