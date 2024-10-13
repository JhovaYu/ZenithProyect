import { Component, OnInit, OnDestroy , AfterViewInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Html5Qrcode } from "html5-qrcode";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  equipoNumber: string = '';
  usoEquipoPropio: boolean = false;
  showScanner: boolean = false;
  showNFC: boolean = false;
  inputCompleted: boolean = false;
  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private toastController: ToastController,
    private http: HttpClient
  ) { }

  ngOnInit() {
  }
  
  


  ngOnDestroy() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(error => console.error(error));
    }
  }

  onEquipoNumberChange() {
    this.inputCompleted = this.equipoNumber.trim().length > 0;
  }

  toggleUsoEquipoPropio() {
    this.usoEquipoPropio = !this.usoEquipoPropio;
    if (this.usoEquipoPropio) {
      this.equipoNumber = '';
      this.inputCompleted = true;
    } else {
      this.inputCompleted = this.equipoNumber.trim().length > 0;
    }
  }

  //////////////////////////////////////////////////////////////////////
  ///QR
  //////////////////////////////////////////////////////////////////////  

  async startScan() {
    try {
      // Solicitar permisos de cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Detener la transmisión inmediatamente después de obtener el permiso

      this.showScanner = true;
      setTimeout(() => {
        this.html5QrCode = new Html5Qrcode("reader");
        if (this.html5QrCode) {
          this.html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            this.onCodeScanned.bind(this),
            (errorMessage) => {
              console.log(`QR error: ${errorMessage}`);
            }
          );
        }
      }, 0);
    } catch (err) {
      console.error(`Error al iniciar el escaneo: ${err}`);
      await this.presentToast('No se pudo acceder a la cámara. Por favor, concede los permisos necesarios.', 'close-circle');
    }
  }

  async onCodeScanned(decodedText: string, decodedResult: any) {
    this.presentToast(`Código escaneado: ${decodedText}`, decodedResult);
    this.showScanner = false;
    if (this.html5QrCode) {
      await this.html5QrCode.stop();
    }
    this.processQRCode(decodedText);
  }

  async processQRCode(qrContent: string) {
    try {
      const qrData = JSON.parse(qrContent);
      await this.presentToast('Procesando código QR...', 'ellipsis-horizontal');
      await this.registerAttendance(parseInt(qrData.claseId, 10));
      await this.presentToast('Asistencia registrada con éxito', 'checkmark-circle');
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      await this.presentToast('Error al registrar la asistencia processQRCode', 'close-circle');
    }
  }

  async registerAttendance(claseId: number) {
    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
      const response = await firstValueFrom (this.http.post('/api/attendance/register', {
        claseId: claseId,
        equipo: this.usoEquipoPropio ? 'Propio' : this.equipoNumber
      }));
      this.presentToast('Asistencia registrada:', 'checkmark-circle');
    } catch (error) {
      this.presentToast('Error al registrar la asistencia registerAttendance:', 'close-circle');
      throw error;
    }
  }

  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      await this.presentToast('Permiso de cámara concedido', 'checkmark-circle');
    } catch (err) {
      console.error('Error al solicitar permiso de cámara:', err);
      await this.presentToast('No se pudo obtener permiso de cámara', 'close-circle');
    }
  }



  startNFC() {
    this.showNFC = true;
    // Aquí iría la lógica para iniciar la lectura NFC en dispositivos móviles
    // Por ahora, simularemos la lectura NFC después de 3 segundos
    setTimeout(() => {
      this.onNFCRead('NFC-67890');
    }, 3000);
  }

  async onNFCRead(nfcData: string) {
    console.log('Datos NFC leídos:', nfcData);
    this.showNFC = false;
    // Aquí puedes agregar la lógica para manejar los datos NFC leídos
    await this.presentToast('Registro exitoso', 'checkmark-circle');
  }

  async presentToast(message: string, icon: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      icon: icon,
      cssClass: 'custom-toast'
    });
    toast.present();
  }
}
