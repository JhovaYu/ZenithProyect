import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AsistenciaPageRoutingModule } from './asistencia-routing.module';
import { AsistenciaPage } from './asistencia.page';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsistenciaPageRoutingModule
  ],
  declarations: [AsistenciaPage],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AsistenciaPageModule {}
