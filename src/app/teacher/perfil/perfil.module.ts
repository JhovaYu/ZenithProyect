import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    PerfilPageRoutingModule
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
