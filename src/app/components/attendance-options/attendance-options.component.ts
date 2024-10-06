import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Clase } from '../../models/clase.model';

@Component({
  selector: 'app-attendance-options',
  templateUrl: './attendance-options.component.html',
  styleUrls: ['./attendance-options.component.scss'],
})
export class AttendanceOptionsComponent  implements OnInit {
  @Input() clase?: Clase;
  
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  selectMethod(method: 'qr' | 'nfc') {
    this.modalCtrl.dismiss({ method });
  }
}
