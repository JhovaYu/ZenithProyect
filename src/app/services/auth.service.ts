import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;
  private userRole: string | null = null;
  private userName: string | null = null;
  private userInfo = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {}

  setUserInfo(user: { id: number, role: string, nombre: string, apellido: string, email: string, matricula: string }) {
    this.userRole = user.role;
    this.userName = `${user.nombre} ${user.apellido}`;
    const userInfo = {
      id: user.id,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      matricula: user.matricula
    };
    this.userInfo.next(userInfo);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', this.userName);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    console.log('Token guardado:', token); // Añade esta línea
    const decodedToken = this.decodeToken(token);
    this.updateUserInfo({
      id: decodedToken.userId,
      role: decodedToken.role,
      nombre: decodedToken.nombre,
      apellido: decodedToken.apellido,
      email: decodedToken.email,
      matricula: decodedToken.matricula
  });
  }

  getUserRole(): string {
    return this.userRole || localStorage.getItem('userRole') || 'student';
  }
  
  setUserRole(role: string) {
    this.userRole = role;
    localStorage.setItem('userRole', role);
  }

  getUserName(): string {
    return this.userName || localStorage.getItem('userName') || 'Usuario';
  }

  getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      console.log('Token recuperado de localStorage:', this.token);
    } else {
      console.log('Token obtenido:', this.token);
    }
    return this.token || '';
  }
  

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token', e);
      return {};
    }
  }

  updateUserInfo(user: any) {
    const updatedUserInfo = {
      id: user.id,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      matricula: user.matricula
    };
    this.userInfo.next(updatedUserInfo);
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
  }

  getUserInfo(): any {
    return this.userInfo.getValue();
  }

  getFullUserInfo(): any {
    let info = this.userInfo.getValue();
    if (!info) {
      const storedInfo = localStorage.getItem('userInfo');
      if (storedInfo) {
        info = JSON.parse(storedInfo);
        this.userInfo.next(info);
      }
    }
    return info;
  }

  getUserInfoObservable() {
    return this.userInfo.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.token = null;
    this.userRole = null;
    this.userName = null;
    this.userInfo.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userInfo');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
