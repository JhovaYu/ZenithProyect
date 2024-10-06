import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  apiUrl = environment.apiUrl;


  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { 
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post(`${this.apiUrl}/login`, this.loginForm.value).subscribe({
        next: (response: any) => {
          console.log('Login exitoso', response);
          this.authService.setToken(response.token);
          this.authService.setUserInfo({
            id: response.id,
            role: response.rol,
            nombre: response.nombre,
            apellido: response.apellido,
            email: response.email,
            matricula: response.matricula
          });
          
          // Redirigir según el rol
          switch(response.rol) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'teacher':
              this.router.navigate(['/teacher']);
              break;
            case 'student':
            default:
              this.router.navigate(['/student/asistencia']);
              break;
          }
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
        }
      });
    }
  }
}
