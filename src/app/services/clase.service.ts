import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Clase } from '../models/clase.model';
import { environment } from '../../environments/environment.prod';
import { HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private apiUrl = `${environment.apiUrl}/api/clases`;

  constructor(private http: HttpClient) {}

  obtenerClases(): Observable<Clase[]> {
    console.log('Iniciando obtenerClases()');
    const token = localStorage.getItem('token');
    console.log('Token recuperado de localStorage:', token);

    const headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      });
    console.log('Headers creados:', headers);

    console.log('Despues de HttpHeaders');
    return this.http.get<Clase[]>(`${this.apiUrl}`, { headers, observe: 'response' }).pipe(
      tap((response) => {
        console.log('Estado HTTP:', response.status); // Verifica si es 200 o algún código de error
        console.log('Respuesta sin procesar:', response);
      }),
      map(response => response.body as Clase[]), // Extraer el cuerpo de la respuesta (que es un array de Clase[])
      catchError((error) => {
        console.error('Error al hacer la solicitud HTTP:', error);
        return throwError(() => error); // Re-emite el error para que pueda ser capturado en el componente
      })
    );
  }

  crearClase(clase: Clase): Observable<Clase> {
    return this.http.post<Clase>(`${this.apiUrl}`, clase);
  }

  actualizarClase(clase: Clase): Observable<Clase> {
    return this.http.put<Clase>(`${this.apiUrl}/${clase.id_clase}`, clase);
  }

  eliminarClase(id_clase: number): Observable<any> {
    if (!id_clase) {
      console.error('Error: id_clase es undefined');
      return throwError(() => new Error('ID de clase no válido'));
    }
    return this.http.delete(`${this.apiUrl}/${id_clase}`);
  }
  
  obtenerClasePorId(id_clase: number): Observable<Clase> {
    return this.http.get<Clase>(`${this.apiUrl}/${id_clase}`);
  }
}
