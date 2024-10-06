import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  constructor(private http: HttpClient) { }

  //Función para generar un código QR para la asistencia
  generateQR(claseId: number): Observable<{ qrCode: string }> {
    return this.http.get<{ qrCode: string }>(`/api/attendance/qr/${claseId}`);
  }
}
