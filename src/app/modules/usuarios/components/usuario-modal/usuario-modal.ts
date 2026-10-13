import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Users as UsuarioService, Usuario } from '../../../../core/services/users';
import { Alerta as AlertaService } from '../../../../core/services/alerta';

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.html',
  styleUrls: ['./usuario-modal.css'],
  standalone: false
})
export class UsuarioModal implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() usuarioEditar: Usuario | null = null;
  @Output() closed = new EventEmitter<boolean>(); 

  isEditando: boolean = false;
  guardando: boolean = false;

  usuarioForm: Usuario = {
    email: '',
    nombre_completo: '',
    rol: 'VIEWER',
    activo: true,
    password: ''
  };

  rolesDisponibles = [
    { value: 'ADMIN', label: 'Administrador (Admin)' },
    { value: 'ANALISTA', label: 'Analista (Analyst)' },
    { value: 'VIEWER', label: 'Visualizador (Viewer)' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.usuarioEditar) {
        this.isEditando = true;
        this.usuarioForm = { ...this.usuarioEditar, password: '' };
      } else {
        this.isEditando = false;
        this.resetForm();
      }
    }
  }

  async guardar(): Promise<void> {
    if (!this.usuarioForm.nombre_completo?.trim() || !this.usuarioForm.email?.trim()) {
      this.alerta.show('El nombre completo y el correo electrónico son obligatorios.', 'warning');
      return;
    }

    if (!this.isEditando && !this.usuarioForm.password?.trim()) {
      this.alerta.show('Debes definir una contraseña para el nuevo usuario.', 'warning');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      if (this.isEditando && this.usuarioForm.id) {
        const payload: Partial<Usuario> = {
          nombre_completo: this.usuarioForm.nombre_completo,
          email: this.usuarioForm.email,
          rol: this.usuarioForm.rol,
          activo: this.usuarioForm.activo
        };

        if (this.usuarioForm.password && this.usuarioForm.password.trim() !== '') {
          payload.password = this.usuarioForm.password;
        }

        await this.usuarioService.actualizarUsuario(this.usuarioForm.id, payload);
        this.alerta.show('Usuario actualizado con éxito.', 'success');
      } else {
        await this.usuarioService.crearUsuario(this.usuarioForm);
        this.alerta.show(`Usuario ${this.usuarioForm.email} creado con éxito.`, 'success');
      }

      this.closed.emit(true);
    } catch (err: any) {
      const msg =
        err?.error?.email?.[0] ||
        err?.error?.password?.[0] ||
        err?.error?.detail ||
        'Error al guardar el usuario.';
      this.alerta.show(msg, 'error');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  cancelar(): void {
    this.closed.emit(false);
  }

  private resetForm(): void {
    this.usuarioForm = {
      email: '',
      nombre_completo: '',
      rol: 'VIEWER',
      activo: true,
      password: ''
    };
  }
}