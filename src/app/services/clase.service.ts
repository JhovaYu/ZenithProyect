import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Clase } from '../models/clase.model';
import { environment } from '../../environments/environment.prod';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private apiUrl = `${environment.apiUrl}/api/clases`;

  constructor(private http: HttpClient) {}

  obtenerClases(): Observable<Clase[]> {
    console.log('Iniciando obtenerClases()');
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.get<Clase[]>(`${this.apiUrl}`, { headers });
    console.log('Terminando obtenerClases()');
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
