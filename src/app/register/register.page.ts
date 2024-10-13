import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  apiUrl = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      matricula: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Formulario enviado:', this.registerForm.value);
      this.http.post(`${this.apiUrl}/register`, this.registerForm.value).subscribe({
        next: (response: any) => {
          console.log('Usuario registrado', response);
          localStorage.setItem('token', response.token);
          this.router.navigate(['/student']);
        },
        error: (error) => {
          console.error('Error al registrar123', error);
          console.log('Datos que supuestamente se estan enviando:', this.registerForm.value);
          // Aquí puedes mostrar un mensaje de error al usuario
        }
      });
    }
  }
}
