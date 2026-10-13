import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Usuarios } from './usuarios/usuarios'; // o './usuarios' si moviste los archivos a la raíz de usuarios

const routes: Routes = [
  {
    path: '',
    component: Usuarios
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {}