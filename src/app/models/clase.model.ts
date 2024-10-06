// src/app/models/clase.model.ts
// Interfaz de Clase para el frontend (relacionada con backend/models/clase.model.js)

export interface Clase {
    id_clase?: number;
    nombre_clase: string;
    hora_inicio: string;
    hora_fin: string;
    dia_semana: string[];
    fecha_inicio: string;
    fecha_fin?: string;
    periodicidad: string;
    duracion_semanas: number;
    aula: string;
    materia: string;
    nota?: string;
    profesorId: number;
  }

  export enum DiaSemana {
    LUNES = 'Lunes',
    MARTES = 'Martes',
    MIERCOLES = 'Miércoles',
    JUEVES = 'Jueves',
    VIERNES = 'Viernes',
    SABADO = 'Sábado',
    DOMINGO = 'Domingo'
  }
  
  export enum Periodicidad {
    UNICA = 'Única',
    SEMANAL = 'Semanal',
    QUINCENAL = 'Quincenal',
    MENSUAL = 'Mensual'
  }