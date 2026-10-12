import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { Paises as PaisesService } from '../../../core/services/pais';
import { Alerta as AlertaService } from '../../../core/services/alerta';

const PAISES_LATAM_VALIDOS = new Set([
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE'
]);

@Component({
  selector: 'app-crear-pais',
  templateUrl: './crear-pais.html',
  styleUrls: ['./crear-pais.css'],
  standalone: false
})
export class CrearPais implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<boolean>();

  sugerenciasLatam = [
    { iso: 'AR', nombre: 'Argentina' },
    { iso: 'BR', nombre: 'Brasil' },
    { iso: 'CL', nombre: 'Chile' },
    { iso: 'CO', nombre: 'Colombia' },
    { iso: 'EC', nombre: 'Ecuador' },
    { iso: 'MX', nombre: 'México' },
    { iso: 'PA', nombre: 'Panamá' },
    { iso: 'PE', nombre: 'Perú' },
    { iso: 'PY', nombre: 'Paraguay' },
    { iso: 'UY', nombre: 'Uruguay' }
  ];

  queryBusqueda: string = '';
  cargando: boolean = false;
  guardando: boolean = false;
  esPaisLatamValido: boolean = false;

  paisForm: any = {
    codigo_iso: '',
    nombre: '',
    moneda_codigo: '',
    moneda_nombre: '',
    region: 'ANDINA',
    latitud: '',
    longitud: '',
    poblacion: 0,
    activo: true
  };

  private miniMap: L.Map | null = null;
  private miniMarker: L.CircleMarker | null = null;

  constructor(
    private paisesService: PaisesService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      setTimeout(() => {
        this.initMiniMap();
      }, 250);
    } else if (changes['isOpen'] && !this.isOpen) {
      this.destruirMapa();
    }
  }

  ngOnDestroy(): void {
    this.destruirMapa();
  }

  private initMiniMap(): void {
    const el = document.getElementById('mini-mapa-preview');
    if (!el) return;

    if (!this.miniMap) {
      this.miniMap = L.map('mini-mapa-preview', {
        center: [-15.0, -60.0],
        zoom: 3
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.miniMap);
    }

    setTimeout(() => {
      this.miniMap?.invalidateSize();
    }, 150);
  }

  private destruirMapa(): void {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
      this.miniMarker = null;
    }
  }

  seleccionarSugerido(sugerido: { iso: string; nombre: string }): void {
    this.queryBusqueda = sugerido.nombre;
    this.buscarPais(sugerido.nombre);
  }

  async buscarPais(nombreABuscar?: string): Promise<void> {
    const nombre = (nombreABuscar || this.queryBusqueda || '').trim();
    if (!nombre) return;

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      const data = await this.paisesService.consultarPaisExterno(nombre);

      const iso = (data.codigo_iso || '').toUpperCase();
      if (!PAISES_LATAM_VALIDOS.has(iso)) {
        this.esPaisLatamValido = false;
        this.resetForm(this.queryBusqueda);
        this.alerta.show(`"${data.nombre || nombre}" no pertenece a Latinoamérica. Solo se admiten países de América Latina.`, 'warning');
        return;
      }

      this.esPaisLatamValido = true;
      this.paisForm = { ...data };

      const lat = parseFloat(data.latitud);
      const lng = parseFloat(data.longitud);

      if (this.miniMap && !isNaN(lat) && !isNaN(lng)) {
        this.miniMap.setView([lat, lng], 5);

        if (this.miniMarker) {
          this.miniMarker.setLatLng([lat, lng]);
        } else {
          this.miniMarker = L.circleMarker([lat, lng], {
            radius: 9,
            fillColor: '#2563eb',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(this.miniMap);
        }
        this.miniMarker.bindPopup(`<strong>${data.nombre}</strong><br/>${data.moneda_codigo}`).openPopup();
        this.miniMap.invalidateSize();
      }
    } catch (err: any) {
      this.esPaisLatamValido = false;
      this.alerta.show(err?.error?.error || 'No se encontró el país ingresado.', 'error');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    if (!this.paisForm.codigo_iso || !this.paisForm.nombre) {
      this.alerta.show('Por favor busca y selecciona un país primero.', 'warning');
      return;
    }

    if (!this.esPaisLatamValido || !PAISES_LATAM_VALIDOS.has(this.paisForm.codigo_iso.toUpperCase())) {
      this.alerta.show('Solo se pueden registrar países de Latinoamérica.', 'error');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      await this.paisesService.crearPais(this.paisForm);
      this.alerta.show(`País ${this.paisForm.nombre} registrado con éxito.`, 'success');
      this.resetForm();
      this.closed.emit(true);
    } catch (error: any) {
      const msj = error?.error?.codigo_iso?.[0] || error?.error?.error || 'Error al guardar el país.';
      this.alerta.show(msj, 'error');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  cancelar(): void {
    this.resetForm();
    this.closed.emit(false);
    this.cdr.detectChanges();

  }

  private resetForm(mantenerQuery: string = ''): void {
    this.queryBusqueda = mantenerQuery;
    this.esPaisLatamValido = false;
    this.paisForm = {
      codigo_iso: '',
      nombre: '',
      moneda_codigo: '',
      moneda_nombre: '',
      region: 'ANDINA',
      latitud: '',
      longitud: '',
      poblacion: 0,
      activo: true
    };
  }
}