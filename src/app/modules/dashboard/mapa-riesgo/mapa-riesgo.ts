import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { Riesgo as RiesgoService, PaisMapa } from '../../../core/services/riesgo';

@Component({
  selector: 'app-mapa-riesgo',
  templateUrl: './mapa-riesgo.html',
  styleUrls: ['./mapa-riesgo.css'],
  standalone: false
})
export class MapaRiesgo implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  public paises: PaisMapa[] = [];
  public isLoading: boolean = true;
  public paisSeleccionado: PaisMapa | null = null;

  constructor(
    private riesgoService: RiesgoService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.iniciarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private iniciarMapa(): void {
    this.map = L.map('mapa-latam', {
      center: [-15.0, -60.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 7
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    if (this.paises.length > 0) {
      this.dibujarPaises();
    }
  }

  async cargarDatos(): Promise<void> {
    try {
      this.isLoading = true;
      this.paises = await this.riesgoService.getDatosMapa();
      if (this.map) {
        this.dibujarPaises();
      }
    } catch (error) {
      console.error('Error cargando datos del mapa:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private dibujarPaises(): void {
    if (!this.map) return;

    this.paises.forEach(pais => {
      if (!pais.latitud || !pais.longitud) return;

      // Círculo interactivo con color según IRPC
      const marker = L.circleMarker([pais.latitud, pais.longitud], {
        radius: 12,
        fillColor: pais.color || '#94a3b8',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(this.map!);

      // Tooltip para el mouse
      const tooltipContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong>${pais.nombre} (${pais.codigo_iso})</strong><br/>
          <span>IRPC: <strong>${pais.irpc !== null ? pais.irpc : 'Sin datos'}</strong></span><br/>
          <span style="color: ${pais.color}; font-weight: 600;">Nivel: ${pais.nivel}</span>
        </div>
      `;
      marker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -8] });

      marker.on('click', () => {
        this.paisSeleccionado = pais;
        this.cdr.detectChanges();
      });
    });
  }
}