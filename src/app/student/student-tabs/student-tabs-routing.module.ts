import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentTabsPage } from './student-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: StudentTabsPage,
    children: [
      {
        path: 'clases',
        loadChildren: () => import('../clases/clases.module').then(m => m.ClasesPageModule)
      },
      {
        path: 'asistencia',
        loadChildren: () => import('../asistencia/asistencia.module').then(m => m.AsistenciaPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: '',
        redirectTo: '/student/asistencia',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentTabsPageRoutingModule {}
