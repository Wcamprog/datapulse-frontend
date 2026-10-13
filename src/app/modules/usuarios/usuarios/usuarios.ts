import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Users as UsuarioService, Usuario } from '../../../core/services/users';
import { Alerta as AlertaService } from '../../../core/services/alerta';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
  standalone: false
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  displayedColumns: string[] = ['nombre_completo', 'email', 'rol', 'activo', 'acciones'];
  isLoading: boolean = false;

  totalItems: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50];

  isModalOpen: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  isConfirmOpen: boolean = false;
  usuarioParaEliminar: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
  }

  async cargarUsuarios(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await this.usuarioService.getUsuarios(this.pageIndex + 1, this.pageSize);
      this.usuarios = res.results;
      this.totalItems = res.count;
    } catch (error: any) {
      this.alerta.show('No fue posible cargar la lista de usuarios.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarUsuarios();
  }

  abrirCrear(): void {
    this.usuarioSeleccionado = null;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  abrirEditar(u: Usuario): void {
    this.usuarioSeleccionado = u;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  onModalUsuarioClosed(recargar: boolean): void {
    this.isModalOpen = false;
    this.usuarioSeleccionado = null;
    this.cdr.detectChanges();
    if (recargar) {
      this.cargarUsuarios();
    }
  }

  async cambiarEstado(u: Usuario): Promise<void> {
    if (!u.id) return;
    const nuevoEstado = !u.activo;

    try {
      await this.usuarioService.actualizarUsuario(u.id, { activo: nuevoEstado });
      u.activo = nuevoEstado;
      this.alerta.show(
        `Usuario ${u.nombre_completo} ${nuevoEstado ? 'activado' : 'desactivado'}.`,
        'success'
      );
      this.cdr.detectChanges();
    } catch {
      this.alerta.show('No se pudo modificar el estado del usuario.', 'error');
    }
  }

  solicitarEliminar(u: Usuario): void {
    this.usuarioParaEliminar = u;
    this.isConfirmOpen = true;
    this.cdr.detectChanges();
  }

  async confirmarEliminacion(): Promise<void> {
    if (!this.usuarioParaEliminar?.id) return;

    try {
      await this.usuarioService.eliminarUsuario(this.usuarioParaEliminar.id);
      this.alerta.show(`Usuario ${this.usuarioParaEliminar.nombre_completo} eliminado.`, 'success');
      this.isConfirmOpen = false;
      this.usuarioParaEliminar = null;
      
      if (this.usuarios.length === 1 && this.pageIndex > 0) {
        this.pageIndex--;
      }
      await this.cargarUsuarios();
    } catch {
      this.alerta.show('No se pudo eliminar el usuario.', 'error');
    } finally {
      this.cdr.detectChanges();
    }
  }

  cancelarEliminacion(): void {
    this.isConfirmOpen = false;
    this.usuarioParaEliminar = null;
    this.cdr.detectChanges();
  }
}