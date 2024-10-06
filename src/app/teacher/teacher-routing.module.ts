import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeacherPage } from './teacher.page';

const routes: Routes = [
  {
    path: '',
    component: TeacherPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'clases',
        loadChildren: () => import('./clases/clases.module').then(m => m.ClasesPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: '',
        redirectTo: '/teacher/clases',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherPageRoutingModule {}
