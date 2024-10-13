import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Clase } from '../models/clase.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private apiUrl = `${environment.apiUrl}/clases`;

  constructor(private http: HttpClient) {}

  obtenerClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(`${this.apiUrl}`);
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
