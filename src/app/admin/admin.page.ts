import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  adminName: string = '';
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) { 
    this.registerForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      rol: ['teacher', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.adminName = this.authService.getUserName();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const token = this.authService.getToken();
      console.log('Token being sent:', token); // Para depuración

      this.http.post('http://localhost:3000/api/admin/register', this.registerForm.value, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).subscribe({
        next: (response) => {
          console.log('Usuario registrado con éxito', response);
          this.registerForm.reset();
        },
        error: (error) => {
          console.error('Error al registrar usuario', error);
          // Muestra más detalles del error
          if (error.error && error.error.message) {
            console.error('Mensaje de error del servidor:', error.error.message);
          }
        }
      });
    }
  }

  toggleRol() {
    const currentRol = this.registerForm.get('rol')?.value;
    this.registerForm.get('rol')?.setValue(currentRol === 'teacher' ? 'admin' : 'teacher');
  }

}
