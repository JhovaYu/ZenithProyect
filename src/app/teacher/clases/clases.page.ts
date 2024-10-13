import { Component, OnInit } from '@angular/core';
import { ClaseService } from '../../services/clase.service';
import { AuthService } from '../../services/auth.service';
import { Clase, DiaSemana, Periodicidad } from '../../models/clase.model';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AttendanceOptionsComponent } from '../../components/attendance-options/attendance-options.component';
import { HttpClient } from '@angular/common/http';
import { QRCodeComponent } from 'src/app/components/qr-code/qr-code.component';
import { QrService } from 'src/app/services/qr.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-clases',
  templateUrl: './clases.page.html',
  styleUrls: ['./clases.page.scss'],
})
export class ClasesPage implements OnInit {

  //Inicializamos las variables para la nueva clase
  mostrarNuevaClaseCard = false;
  nuevaClase: Clase = { 
    nombre_clase: '',
    hora_inicio: '',
    hora_fin: '',
    dia_semana: [],
    fecha_inicio: new Date().toISOString(),
    periodicidad: '',
    duracion_semanas: 1,
    aula: '',
    materia: '',
    profesorId: 0,
   };
  clases: Clase[] = [];

  //Inicializamos las variables para la nueva clase 
  diasSemana = Object.values(DiaSemana);
  periodicidades = Object.values(Periodicidad);

  //Inicializamos las variables para la clase en edición de modo bimodal
  claseEnEdicion: Clase | null = null;

  //Propiedad para expandir o contraer la tarjeta de la clase
  expandedCard: number | null = null;

  constructor(
    private claseService: ClaseService,
    private authService: AuthService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient,
    private qrService: QrService
  ) { }

  //Cargamos las clases al iniciar la página
  ngOnInit() {
    this.cargarClases();
  }

  //Función para mostrar o esconder el modal de nueva clase
  toggleNuevaClaseCard() {
    this.mostrarNuevaClaseCard = !this.mostrarNuevaClaseCard;
    if (!this.mostrarNuevaClaseCard) {
      this.resetNuevaClase();
      this.claseEnEdicion = null;
    }
    console.log('mostrarNuevaClaseCard:', this.mostrarNuevaClaseCard);
  }

  //Función para agregar una nueva clase
  agregarNuevaClase() {
    this.mostrarNuevaClaseCard = true;
    // Reiniciar los valores de nuevaClase si es necesario
  }

  //Función para expandir o contraer la tarjeta de la clase
  toggleCard(index: number) {
    if (this.expandedCard === index) {
      this.expandedCard = null;
    } else {
      this.expandedCard = index;
    }
  }

  //Función para resetear el formulario de nueva clase
  resetNuevaClase() {
    this.nuevaClase = {
      nombre_clase: '',
      hora_inicio: '',
      hora_fin: '',
      dia_semana: [],
      fecha_inicio: new Date().toISOString(),
      periodicidad: '',
      duracion_semanas: 1,
      aula: '',
      materia: '',
      profesorId: 0
    };  
  }

  //Función para editar una clase
  editarClase(clase: Clase) {
    this.claseEnEdicion = { ...clase };
    //this.nuevaClase = { ...clase };

    if (this.claseEnEdicion.hora_inicio) {
      this.claseEnEdicion.hora_inicio = this.formatearHora(this.claseEnEdicion.hora_inicio);
    }
    if (this.claseEnEdicion.hora_fin) {
      this.claseEnEdicion.hora_fin = this.formatearHora(this.claseEnEdicion.hora_fin);
    }

    this.mostrarNuevaClaseCard = true;
  }

  //Función para cambiar la fecha de inicio
  onFechaInicioChange(event: any) {
    const fecha = new Date(event.detail.value);
    this.nuevaClase.fecha_inicio = fecha.toISOString().split('T')[0];
  }
  
  //Función para cambiar la hora de inicio
  onHoraInicioChange(event: any) {
    const hora = event.detail.value;
    if (hora) {
      const [hours, minutes] = hora.split('T')[1].split(':');
      this.nuevaClase.hora_inicio = `${hours}:${minutes}:00`;
    }
  }

  //Función para cambiar la hora de fin
  onHoraFinChange(event: any) {
    const hora = event.detail.value;
    if (hora) {
      const [hours, minutes] = hora.split('T')[1].split(':');
      this.nuevaClase.hora_fin = `${hours}:${minutes}:00`;
    }
  }

  //Función para cancelar la edición de una clase
  cancelarEdicion() {
    this.claseEnEdicion = null;
    this.mostrarNuevaClaseCard = false;
  }

  //Función para guardar una clase
  guardarClase() {
    console.log('Iniciando guardarClase()');
    const userInfo = this.authService.getFullUserInfo();
    console.log('UserInfo obtenido:', userInfo);
  
    if (userInfo && userInfo.id) {
      console.log('UserInfo.id existe:', userInfo.id);

      const claseParaGuardar = this.claseEnEdicion || this.nuevaClase;

      claseParaGuardar.hora_inicio = this.formatearHora(claseParaGuardar.hora_inicio);
      claseParaGuardar.hora_fin = this.formatearHora(claseParaGuardar.hora_fin);
      
      console.log('Hora inicio:', claseParaGuardar.hora_inicio);
      console.log('Hora fin:', claseParaGuardar.hora_fin);
  
      claseParaGuardar.profesorId = userInfo.id;
      console.log('Nueva clase a crear:', claseParaGuardar);

      const operacion = this.claseEnEdicion 
        ? this.claseService.actualizarClase(claseParaGuardar)
        : this.claseService.crearClase(claseParaGuardar);

      operacion.subscribe({
        next: (claseGuardada) => {
          console.log('Clase guardada exitosamente:', claseGuardada);
          this.cargarClases(); 
          this.toggleNuevaClaseCard();
          this.resetNuevaClase();
          this.claseEnEdicion = null;
        },
        error: (error) => {
          console.error('Error al guardar la clase', error);
          console.log('Detalles de la clase que se intentó guardar:', claseParaGuardar);
          // Aquí podrías agregar una notificación de error para el usuario
        }
      });
    } else {
      console.error('No se pudo obtener la información del usuario o el ID es undefined');
      console.log('Contenido de userInfo:', userInfo);
      // Aquí podrías agregar una notificación de error para el usuario
    }
  }

  //Función para extraer la hora de una fecha
  private extraerHora(fechaHora: string): string {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toTimeString().split(' ')[0];
  }

  //Función para formatear la hora
  private formatearHora(hora: string): string {
    if (!hora || hora === 'Invalid') {
      return '00:00:00'; // Valor por defecto si la hora es inválida
    }
    const [hours, minutes] = hora.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  }

  //Función para cargar las clases
  cargarClases() {
    console.log('Iniciando cargarClases()');
    this.claseService.obtenerClases().subscribe({
      next: (clases) => {
        console.log('Clases obtenidas exitosamente:', clases);

        // Verificar si hay clases
      if (clases.length === 0) {
        console.warn('No se encontraron clases');
      }
        this.clases = clases.map(clase => ({
          ...clase,
          dia_semana: Array.isArray(clase.dia_semana) ? clase.dia_semana : JSON.parse(clase.dia_semana)
        }));
      },

      error: (error) => {
        console.error('Error al cargar las clases', error);
        console.error('Detalles del error:', error.message, 'Status:', error.status, 'URL:', error.url);
      }  
    });
  }

  //Función asincrona para mostrar el action sheet
  async presentActionSheet(clase: Clase) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar',
          icon: 'pencil',
          handler: () => {
            this.editarClase(clase);
          }
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.confirmarEliminarClase(clase);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async confirmarEliminarClase(clase: Clase) {
    if (!clase || !clase.id_clase) {
      console.error('Error: La clase o su ID es undefined', clase);
      // Puedes mostrar un mensaje de error al usuario aquí
      return;
    }
  
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta clase?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.claseService.eliminarClase(clase.id_clase!).subscribe({
              next: () => {
                console.log('Clase eliminada con éxito');
                this.cargarClases(); // Recargar la lista de clases
              },
              error: (error) => {
                console.error('Error al eliminar la clase', error);
                // Puedes mostrar un mensaje de error al usuario aquí
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  //Función para pasar la lista de asistencia
  async pasarLista(clase: Clase) {
    const modal = await this.modalController.create({
      component: AttendanceOptionsComponent,
      componentProps: { clase: clase }
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
    if (data && data.method === 'qr') {
      if (clase.id_clase !== undefined) {
        this.generarQR(clase.id_clase);
      } else {
        console.error('La clase no tiene un ID válido');
        // Manejar el caso de ID inválido
      }
    } else if (data && data.method === 'nfc') {
      // Implementar lógica para NFC si es necesario
      console.log('NFC seleccionado, implementación pendiente');
    }
  }

  async generarQR(claseId: number) {
    try {
      const response = await firstValueFrom(this.qrService.generateQR(claseId));
      if (response && response.qrCode) {
        const qrCodeModal = await this.modalController.create({
          component: QRCodeComponent,
          componentProps: { qrCode: response.qrCode }
        });
        await qrCodeModal.present();
      } else {
        console.error('La respuesta está vacía');
        // Manejar el caso de respuesta vacía
      }
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      // Mostrar un mensaje de error al usuario
    }
  }

  async generarInforme(clase: Clase) {
    const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    try {
      const response = await firstValueFrom(
        this.http.get(`/api/attendance/report/${clase.id_clase}/${date}`, { responseType: 'blob' })
      );
      
      if (response) {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = `asistencia_${clase.id_clase}_${date}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        console.error('La respuesta está vacía');
        
      }
      
    } catch (error) {
      console.error('Error al generar el informe:', error);
      // Mostrar un mensaje de error al usuario
    }
  }
}

