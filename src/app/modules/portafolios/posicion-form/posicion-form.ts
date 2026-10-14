import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Portafolio as PortafolioService, PosicionDTO } from '../../../core/services/portafolio';
import { Paises as PaisesService } from '../../../core/services/pais';
import { Alerta as AlertaService } from '../../../core/services/alerta';
import { getFechaHoyColombia } from '../../../core/utils/date.utils';
@Component({
  selector: 'app-posicion-form',
  templateUrl: './posicion-form.html',
  styleUrls: ['./posicion-form.css'],
  standalone: false
})
export class PosicionForm implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() portafolioId!: number;
  @Input() posicionAEditar: PosicionDTO | null = null;
  @Output() closed = new EventEmitter<boolean>(); 

  form!: FormGroup;
  paises: any[] = [];
  tiposActivo = [
    { valor: 'RENTA_FIJA', etiqueta: 'Renta Fija' },
    { valor: 'RENTA_VARIABLE', etiqueta: 'Renta Variable' },
    { valor: 'COMMODITIES', etiqueta: 'Commodities' },
    { valor: 'MONEDA', etiqueta: 'Moneda' }
  ];

  isSaving: boolean = false;
  isLoadingPaises: boolean = false;

  constructor(
    private fb: FormBuilder,
    private portafolioService: PortafolioService,
    private paisesService: PaisesService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.cargarPaises();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['posicionAEditar'] && this.form) {
      if (this.posicionAEditar) {
        this.form.patchValue({
          pais: this.posicionAEditar.pais,
          tipo_activo: this.posicionAEditar.tipo_activo,
          monto_inversion_usd: this.posicionAEditar.monto_inversion_usd,
          fecha_entrada: this.posicionAEditar.fecha_entrada,
          notas: this.posicionAEditar.notas || ''
        });
      } else {
        this.resetearForm();
      }
    }
  }

  private initForm(): void {
    const hoy = getFechaHoyColombia();
    this.form = this.fb.group({
      pais: ['', [Validators.required]],
      tipo_activo: ['RENTA_FIJA', [Validators.required]],
      monto_inversion_usd: [null, [Validators.required, Validators.min(1)]],
      fecha_entrada: [hoy, [Validators.required]],
      notas: ['', [Validators.maxLength(200)]]
    });
  }

  private async cargarPaises(): Promise<void> {
    this.isLoadingPaises = true;
    try {
      const data = await this.paisesService.getPaises();
      this.paises = Array.isArray(data) ? data : (data?.results || []);
    } catch (error) {
      this.alerta.show('No se pudieron cargar los países.', 'error');
    } finally {
      this.isLoadingPaises = false;
      this.cdr.detectChanges();
    }
  }

  private resetearForm(): void {
    const hoy = new Date().toISOString().substring(0, 10);
    this.form?.reset({
      pais: '',
      tipo_activo: 'RENTA_FIJA',
      monto_inversion_usd: null,
      fecha_entrada: hoy,
      notas: ''
    });
  }

  cerrar(guardado: boolean = false): void {
    this.resetearForm();
    this.closed.emit(guardado);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    const payload: any = {
      ...this.form.value,
      portafolio: Number(this.portafolioId),
      monto_inversion_usd: Number(this.form.value.monto_inversion_usd),
      fecha_salida: this.posicionAEditar?.fecha_salida || null
    };

    try {
      if (this.posicionAEditar?.id) {
        await this.portafolioService.actualizarPosicion(
          this.portafolioId,
          this.posicionAEditar.id,
          payload
        );
        this.alerta.show('Posición actualizada exitosamente.', 'success');
      } else {
        await this.portafolioService.agregarPosicion(this.portafolioId, payload);
        this.alerta.show('Posición agregada exitosamente.', 'success');
      }
      this.cerrar(true);
    } catch (error: any) {
      console.error('Error al guardar posición:', error);
      const msg = 
        error?.error?.portafolio?.[0] ||
        error?.error?.monto_inversion_usd?.[0] ||
        error?.error?.detail || 
        error?.error?.error || 
        'Error al registrar la posición en el servidor.';
      this.alerta.show(msg, 'error');
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }
}