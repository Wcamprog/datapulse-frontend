import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Portafolio as PortafolioService, PortafolioDTO } from '../../../core/services/portafolio';
import { Alerta as AlertaService } from '../../../core/services/alerta';

@Component({
  selector: 'app-portafolio-modal',
  templateUrl: './portafolio-modal.html',
  styleUrls: ['./portafolio-modal.css'],
  standalone: false
})
export class PortafolioModal implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() portafolioEditar: PortafolioDTO | null = null;
  @Output() closed = new EventEmitter<boolean>(); 

  form!: FormGroup;
  isEditando: boolean = false;
  guardando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private portafolioService: PortafolioService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      es_publico: [false],
      activo: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.portafolioEditar) {
        this.isEditando = true;
        this.form.patchValue({
          nombre: this.portafolioEditar.nombre,
          descripcion: this.portafolioEditar.descripcion || '',
          es_publico: this.portafolioEditar.es_publico,
          activo: this.portafolioEditar.activo
        });
      } else {
        this.isEditando = false;
        this.form.reset({
          nombre: '',
          descripcion: '',
          es_publico: false,
          activo: true
        });
      }
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: Partial<PortafolioDTO> = this.form.value;

    try {
      if (this.isEditando && this.portafolioEditar?.id) {
        await this.portafolioService.actualizarPortafolio(this.portafolioEditar.id, payload);
        this.alerta.show('Portafolio actualizado con éxito.', 'success');
      } else {
        await this.portafolioService.crearPortafolio(payload);
        this.alerta.show('Portafolio creado con éxito.', 'success');
      }
      this.closed.emit(true);
    } catch (err: any) {
      const msg = err?.error?.nombre?.[0] || err?.error?.detail || 'Error al procesar el portafolio.';
      this.alerta.show(msg, 'error');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  cancelar(): void {
    this.closed.emit(false);
  }
}