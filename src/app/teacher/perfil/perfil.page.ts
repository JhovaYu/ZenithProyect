import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  profileForm: FormGroup;
  teacherName: string = '';
  teacherLastName: string = '';
  teacherEmail: string = '';
  profileImage: string = 'https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y';
  editingFields: { [key: string]: boolean } = { name: false };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]]
    });
    this.loadUserProfile();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.teacherName = userInfo.nombre || '';
      this.teacherLastName = userInfo.apellido || '';
      this.teacherEmail = userInfo.email || '';

      this.profileForm.patchValue({
        nombre: this.teacherName,
        apellido: this.teacherLastName,
        email: this.teacherEmail
      });
    } else {
      // Si no hay información del usuario, intentar obtenerla del servidor
      this.http.get(`${environment.apiUrl}/teacher/profile`, {
        headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
      }).subscribe({
        next: (response: any) => {
          this.authService.updateUserInfo(response);
          this.loadUserProfile(); // Llamar recursivamente para actualizar la información
        },
        error: (error) => {
          console.error('Error al cargar el perfil', error);
          if (error.status === 401) {
            this.authService.logout();
          }
        }
      });
    }
  }

  toggleEdit(field: string) {
    this.editingFields[field] = !this.editingFields[field];
    if (this.editingFields[field]) {
      this.profileForm.get('nombre')?.enable();
      this.profileForm.get('apellido')?.enable();
    } else {
      this.profileForm.get('nombre')?.disable();
      this.profileForm.get('apellido')?.disable();
    }
    // El campo de correo electrónico siempre permanece deshabilitado
    this.profileForm.get('email')?.disable();
  }

  isEditing(field: string): boolean {
    return this.editingFields[field];
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedProfile = this.profileForm.value;
      const token = this.authService.getToken();
      this.http.put(`${environment.apiUrl}/teacher/profile`, updatedProfile, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => {
          this.presentToast('Perfil actualizado con éxito');
          this.authService.updateUserInfo(response.user);
          this.loadUserProfile();
          this.toggleEdit('name');
        },
        error: (error) => {
          console.error('Error al actualizar el perfil', error);
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            this.presentToast('Sesión expirada. Por favor, inicie sesión nuevamente.');
          } else {
            this.presentToast('Error al actualizar el perfil: ' + (error.error?.message || error.message));
          }
        }
      });
    }
  }

  changePassword() {
    // Implementaremos esta funcionalidad más adelante
    console.log('Cambiar contraseña');
  }

  changeProfileImage() {
    // Aquí implementaremos la lógica para cambiar la imagen de perfil
    console.log('Cambiar imagen de perfil');
  }

  logout() {
    this.authService.logout();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
