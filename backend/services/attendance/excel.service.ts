import * as ExcelJS from 'exceljs';
import { ClaseModel } from '../../models/clase.model';
import { AttendanceModel, AttendanceInstance } from '../../models/attendance.model';
import { UserModel } from '../../models/user.model';
import { sequelize, User, Clase, Attendance } from '../../server';
import { Op } from 'sequelize';



export async function generateAttendanceReport(claseId: number, date: string): Promise<Buffer> {
  console.log('Generando informe de asistencia para claseId:', claseId, 'y fecha:', date);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Asistencia');

  worksheet.addRow(['Nombre Completo', 'Matrícula', 'Correo', 'Equipo']);

  try {
    console.log('Buscando asistencias para claseId:', claseId, 'y fecha:', date);
    const asistencias = await Attendance.findAll({
      where: {
        claseId: claseId,
        
      },
      include: [{
        model: User,
        attributes: ['nombre', 'apellido', 'matricula', 'email']
      }]
    });

    console.log('Encontradas', asistencias.length, 'asistencias');

    asistencias.forEach((asistencia: AttendanceInstance) => {
      console.log('Procesando asistencia');
      if(asistencia.User) {
      const estudiante = asistencia.User ;
      console.log('Estudiante encontrado:', estudiante.nombre, estudiante.apellido);
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
  
    console.log('Generando archivo Excel...');
    return await workbook.xlsx.writeBuffer() as Buffer;
  } catch (error) {
    console.error('Error al generar el informe de asistencia:', error);
    throw error;
  }
}