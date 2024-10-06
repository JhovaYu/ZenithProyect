import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';



@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QRCodeComponent {
  @Input() qrCode: string = '';

  constructor(private modalController: ModalController) {}

  cerrarModal() {
    this.modalController.dismiss();
  }
}
