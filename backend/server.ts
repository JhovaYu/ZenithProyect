declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response } from 'express';
import { Sequelize, Model, DataTypes, Config } from 'sequelize';
import { initializeAssociations } from './models/associations';
import config, { DatabaseConfig, AppConfig } from './config/config';
import cors from 'cors';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserModel, UserInstance, UserAttributes, CreateUserAttributes } from './models/user.model';
import { ClaseModel, ClaseInstance, ClaseAttributes } from './models/clase.model';
import { AttendanceInstance, AttendanceAttributes } from './models/attendance.model';
import { generateAttendanceReport } from './services/attendance/excel.service';
import { generateQRCode } from './services/qr.services';

if (process.env['NODE_ENV'] == 'production') {
  const requiredEnvVars = ['MYSQLPASSWORD', 'MYSQLDATABASE', 'MYSQLHOST'];
  const missingEnvVars: string[] = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingEnvVars.push(varName);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error('Faltan algunas variables de entorno requeridas para la base de datos:', missingEnvVars.join(', '));
    throw new Error('Faltan algunas variables de entorno requeridas para la base de datos.');
  }
}

const JWT_SECRET: string = process.env['JWT_SECRET'] || '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Configura una clave secreta en las variables de entorno.');
}


//Configuración del servidor
const app: express.Application = express();
const env = process.env['NODE_ENV'] || 'development';
const dbConfig = config[env as keyof AppConfig];
const port: number = parseInt(process.env['PORT'] || '3000', 10);

const corsOptions = {
  origin: 'https://zenithproyect-production.up.railway.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};


//Middleware para permitir solicitudes desde cualquier origen
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../www')));





export const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  dialectOptions: dbConfig.dialectOptions
}); 

export const { User, Clase, Attendance } = initializeAssociations();


//Conexión a la base de datos
async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw new Error('No se pudo conectar a la base de datos. Verifica la configuración.');
  }
}

connectDatabase();


//Middleware para loggear las solicitudes
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`Recibida solicitud: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});


//Middleware para servir archivos estáticos
/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../www/index.html'));
});
*/





//Ruta para registrar un nuevo usuario
app.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { nombre, apellido, matricula, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      nombre, 
      apellido, 
      matricula, 
      email, 
      password: hashedPassword, 
      rol: 'student' 
    });
    const token = jwt.sign({ userId: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Usuario registrado con éxito', token });
  } catch (error) {
    console.error('Error de validación1:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error al registrar usuario', error: error.message });
    } else {
      res.status(400).json({ message: 'Error al registrar usuario', error: 'Un error desconocido ocurrió' });
    }
  }
});


//Ruta para iniciar sesión
app.post('/login', (req: Request, res: Response, next: express.NextFunction) => {
  (async (): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { 
        userId: user.id, 
        rol: user.rol, 
        nombre: user.nombre, 
        apellido: user.apellido,
        email: user.email,
        matricula: user.matricula
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.json({ 
      message: 'Login exitoso', 
      token, 
      id: user.id,
      rol: user.rol, 
      nombre: user.nombre, 
      apellido: user.apellido,
      email: user.email,
      matricula: user.matricula
    });
    return;
  } catch (error) {
    next(error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } else {
      res.status(500).json({ message: 'Error en el servidor', error: 'Un error desconocido ocurrió' });
    }
  }
})();
});

// Middleware para verificar el token
interface CustomJwtPayload extends jwt.JwtPayload {
  userId: number;
  rol: string;
}

const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    console.log('No se proporcionó token');
    res.status(403).json({ message: 'No se proporcionó token' });
    return;
  }

  const [, token] = bearerHeader.split(' ');
  if (!token) {
    console.log('Formato de token inválido');
    res.status(403).json({ message: 'Formato de token inválido' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error al verificar el token:', err);
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    const payload = decoded as CustomJwtPayload;
    console.log('Token decodificado:', payload);
    req.userId = payload.userId;
    req.userRole = payload.rol;
    next();
  });
};


//Ruta para obtener el perfil del usuario
app.get('/api/user', verifyToken,  async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'nombre', 'apellido', 'matricula', 'email', 'rol']
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } else {
      res.status(500).json({ message: 'Error en el servidor', error: 'Un error desconocido ocurrió' });
    }
  }
});

// Middleware para verificar el rol del usuario
const checkRole = (roles: string[]): express.RequestHandler => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!req.userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    if (!req.userRole) {
      res.status(403).json({ message: 'Rol de usuario no definido' });
      return;
    }
    if (!roles.includes(req.userRole)) {
      res.status(403).json({ message: 'No autorizado' });
      return;
    }
    next();
  };
};

// Ejemplo de uso
app.get('/api/admin', verifyToken, checkRole(['admin']), (req: express.Request, res: express.Response) => {
  // Lógica para administradores
});

app.get('/api/teacher', verifyToken, checkRole(['admin', 'teacher']), (req: express.Request, res: express.Response) => {
  // Lógica para profesores
});

//Ruta para actualizar el perfil del usuario
app.put('/api/teacher/profile', verifyToken, checkRole(['admin', 'teacher']), async (req: express.Request, res: express.Response) => {
  try {
    const { nombre, apellido } = req.body;
    const userId = req.userId;

    // Actualizar el usuario en la base de datos
    const [updatedRows] = await User.update(
      { nombre, apellido },
      { where: { id: userId } }
    );

    if (updatedRows > 0) {
      // Obtener el usuario actualizado
      const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
      });

      res.json({ message: 'Perfil actualizado con éxito', user: updatedUser });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } else {
      res.status(500).json({ message: 'Error en el servidor', error: 'Un error desconocido ocurrió' });
    }
  }
});

// Middleware para verificar si el usuario es admin
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

// Nueva ruta para que los admins registren otros usuarios
app.post('/api/admin/register', verifyToken, isAdmin, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Intento de registro de admin. User ID:', req.userId, 'Role:', req.userRole);
  try {
    const { nombre, apellido, matricula, email, password, rol } = req.body;
    
    // Validar que el rol sea válido
    if (!['admin', 'teacher'].includes(rol)) {
      res.status(400).json({ message: 'Rol no válido' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      nombre, 
      apellido, 
      matricula, 
      email, 
      password: hashedPassword, 
      rol 
    });
    
    res.status(201).json({ message: 'Usuario registrado con éxito', userId: user.id });
  } catch (error) {
    next(error);
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error al registrar usuario 1', error: error.message });
    } else {
      res.status(400).json({ message: 'Error al registrar usuario 2', error: 'Un error desconocido ocurrió' });
    }
  }
});

////////////////////////////////////////////////////////////////////
///TEACHER
////////////////////////////////////////////////////////////////////  



////////////////////////////////////////////////////////////////////
///PAGINA DE CLASES 
////////////////////////////////////////////////////////////////////  



//Relación entre la tabla de clases y la tabla de usuarios
User.hasMany(Clase, { foreignKey: 'profesorId' });
Clase.belongsTo(User, { foreignKey: 'profesorId' });


//Ruta para crear una nueva clase
app.post('/api/clases', verifyToken, checkRole(['admin', 'teacher']), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { 
      nombre_clase, 
      hora_inicio, 
      hora_fin, 
      dia_semana, 
      fecha_inicio, 
      fecha_fin, 
      periodicidad, 
      duracion_semanas, 
      aula, 
      materia, 
      nota 
     } = req.body;

     const diasSemana = Array.isArray(dia_semana) ? dia_semana : [dia_semana];
     
     if (req.userId === undefined) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

     const clase = await Clase.create({
      nombre_clase,
      hora_inicio,
      hora_fin,
      dia_semana: JSON.stringify(diasSemana),
      fecha_inicio,
      fecha_fin,
      periodicidad,
      duracion_semanas,
      aula,
      materia,
      nota,
      profesorId: req.userId 
    }) as ClaseInstance;
    res.status(201).json(clase);
  } catch (error) {
    next(error);
    console.error('Error al crear la clase:', error);
    res.status(400).json({ message: 'Error al crear la clase', error: error instanceof Error ? error.message : 'Un error desconocido ocurrió' });
  }
});


//Ruta para obtener las clases
app.get('/clases',async (req: express.Request, res: express.Response) => {
  console.log('Intento de obtener clases. User ID:', req.userId, 'Rol:', req.userRole);
  console.log('Headers recibidos server:', req.headers);

  try {
    const clases = await Clase.findAll({
      where: req.userRole === 'teacher' ? { profesorId: req.userId } : {},
      include: [{ model: User, attributes: ['nombre', 'apellido'] }],
      order: [['fecha_inicio', 'ASC'], ['hora_inicio', 'ASC']]
    });

    if (clases.length === 0) {
      console.warn('No se encontraron clases para el usuario', req.userId);
      res.status(404).json({ message: 'No se encontraron clases' });
    } else {
      console.log('Clases encontradas:', clases);
    }

    console.log('Clases encontradas:', clases); // Agregar un log aquí
    console.log('Clases en JSON:', JSON.stringify(clases, null, 2));

    res.setHeader('Content-Type', 'application/json');
    res.json(clases);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener las clases:', error.message, error.stack);
      res.status(500).json({ message: 'Error al obtener las clases', error: error.message });
    } else {
      console.error('Error desconocido al obtener las clases');
      res.status(500).json({ message: 'Error al obtener las clases', error: 'Un error desconocido ocurrió' });
    }
  }
});


//Ruta para actualizar una clase
app.put('/api/clases/:id', verifyToken, checkRole(['admin', 'teacher']), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      nombre_clase, 
      hora_inicio, 
      hora_fin, 
      dia_semana, 
      fecha_inicio, 
      fecha_fin, 
      periodicidad, 
      duracion_semanas, 
      aula, 
      materia, 
      nota 
    } = req.body;

    const clase = await Clase.findByPk(id);

    if (!clase) {
      res.status(404).json({ message: 'Clase no encontrada' });
      return;
    }

    if (clase.profesorId !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permiso para editar esta clase' });
      return;
    }

    const formatearHora = (hora: string | null): Date | undefined => {
      if (!hora || hora === 'Invalid') return undefined;
      const [hours, minutes] = hora.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return date;
    };

    await clase.update({
      nombre_clase,
      hora_inicio: formatearHora(hora_inicio),
      hora_fin: formatearHora(hora_fin),
      dia_semana: JSON.stringify(Array.isArray(dia_semana) ? dia_semana : [dia_semana]),
      fecha_inicio,
      fecha_fin,
      periodicidad,
      duracion_semanas,
      aula,
      materia,
      nota
    });

    res.json({ message: 'Clase actualizada con éxito', clase });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/clases/:id', verifyToken, checkRole(['admin', 'teacher']), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const clase = await Clase.findByPk(id);

    if (!clase) {
      res.status(404).json({ message: 'Clase no encontrada' });
      return;
    }

    if (clase.profesorId !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta clase' });
      return;
    }

    await clase.destroy();
    res.json({ message: 'Clase eliminada con éxito' });
  } catch (error) {
    next(error);
    if (error instanceof Error) {
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ message: 'Error al eliminar la clase', error: error.message });
    } else {
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ message: 'Error al eliminar la clase', error: 'Un error desconocido ocurrió' });
    }
  }
});

////////////////////////////////////////////////////////////////////
///QR
////////////////////////////////////////////////////////////////////

app.get('/api/attendance/qr/:claseId',
  (req, res, next) => {
    console.log('Recibida solicitud para generar QR');
    next();
  },
   verifyToken,
   (req, res, next) => {
    console.log('Token verificado');
    next();
  },
    checkRole(['teacher']),
    (req, res, next) => {
      console.log('Rol verificado');
      next();
    },
    async (req, res, next) => {
  try {
    const { claseId } = req.params;
    console.log('Generando QR para claseId:', claseId);
    const qrData = JSON.stringify({ claseId, teacherId: req.userId });
    const qrCode = await generateQRCode(qrData);
    res.json({ qrCode });
  } catch (error) {
    console.error('Error al generar QR:', error);
    next(error);
    res.status(500).json({ message: 'Error al generar código QR', error: error instanceof Error ? error.message : 'Un error desconocido ocurrió' });
  }
});

////////////////////////////////////////////////////////////////////
///REGISTRO DE ASISTENCIA
////////////////////////////////////////////////////////////////////

//Ruta para registrar la asistencia de un estudiante
app.post('/attendance/register', verifyToken, checkRole(['student']), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { claseId, equipo } = req.body;
    if (req.userId === undefined) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const studentId = req.userId;
    const date = new Date();

    const attendance = await Attendance.create({
      claseId,
      studentId,
      date,
      presente: true,
      equipo
    });

    res.status(201).json({ message: 'Asistencia registrada con éxito', attendance });
  } catch (error) {
    next(error);
  }
});

//Ruta para generar el informe de asistencia
app.get('/api/attendance/report/:claseId/:date', verifyToken, checkRole(['teacher']), async (req, res, next) => {
  try {
    const { claseId, date } = req.params;
    const buffer = await generateAttendanceReport(parseInt(claseId), date);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia_${claseId}_${date}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
    res.status(500).json({ message: 'Error al generar el informe de asistencia', error: error instanceof Error ? error.message : 'Un error desconocido ocurrió' });
  }
});




////////////////////////////////////////////////////////////////////
///STUDENT
////////////////////////////////////////////////////////////////////  

////////////////////////////////////////////////////////////////////
/// PERFIL
////////////////////////////////////////////////////////////////////  

//Ruta para actualizar el perfil del estudiante
app.put('/api/student/profile', verifyToken, checkRole(['student']), async (req: express.Request, res: express.Response) => {
  try {
    const { nombre, apellido } = req.body;
    const userId = req.userId;

    const [updatedRows] = await User.update(
      { nombre, apellido },
      { where: { id: userId } }
    );

    if (updatedRows > 0) {
      const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'nombre', 'apellido', 'email', 'matricula', 'rol']
      });

      res.json({ message: 'Perfil actualizado con éxito', user: updatedUser });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    } else {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ message: 'Error en el servidor', error: 'Un error desconocido ocurrió' });
    }
  }
});


////////////////////////////////////////////////////////////////////
/// ASISTENCIA
////////////////////////////////////////////////////////////////////    

// Iniciar sesión de asistencia
app.post('/attendance/start', verifyToken, checkRole(['teacher']), async (req: express.Request, res: express.Response) => {
  // Lógica para iniciar la sesión de asistencia
});

// Registrar asistencia de estudiante
app.post('/attendance/register', verifyToken, checkRole(['student']), async (req: express.Request, res: express.Response) => {
  // Lógica para registrar la asistencia de un estudiante
});

// Finalizar sesión de asistencia y generar informe
app.post('/attendance/end', verifyToken, checkRole(['teacher']), async (req: express.Request, res: express.Response) => {
  // Lógica para finalizar la sesión y generar el informe
});

////////////////////////////////////////////////////////////////////
/// EXCEL
////////////////////////////////////////////////////////////////////    



// Endpoint para generar informe de asistencia
app.get('/api/attendance/report/:claseId/:date', verifyToken, checkRole(['admin', 'teacher']), async (req: express.Request, res: express.Response) => {
  try {
    const { claseId, date } = req.params;
    const buffer = await generateAttendanceReport(parseInt(claseId), date);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=asistencia_${claseId}_${date}.xlsx`);
    res.send(buffer);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al generar el informe de asistencia:', error);
      res.status(500).json({ message: 'Error al generar el informe de asistencia', error: error.message });
    } else {
      console.error('Error al generar el informe de asistencia:', error);
      res.status(500).json({ message: 'Error al generar el informe de asistencia', error: 'Un error desconocido ocurrió' });
    }
  }
});







//Middleware para manejar errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error en el servidor', error: err.message });
});


// Iniciar el servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');
    
    await sequelize.sync(); // { force: true } solo en desarrollo
    console.log('Modelos sincronizados con la base de datos');

    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();




