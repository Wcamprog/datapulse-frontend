import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import {
  Riesgo as RiesgoService,
  TipoIndicador,
  TendenciasResponse
} from '../../../core/services/riesgo';

interface IndicadorOpcion {
  valor: TipoIndicador;
  texto: string;
}

interface PaisOpcion {
  codigo_iso: string;
  nombre: string;
}

@Component({
  selector: 'app-grafico-tendencias',
  templateUrl: './grafico-tendencias.html',
  styleUrls: ['./grafico-tendencias.css'],
  standalone: false
})
export class GraficoTendencias implements AfterViewInit, OnDestroy {
  @ViewChild('canvasTendencias', { static: true }) canvasTendencias!: ElementRef<HTMLCanvasElement>;

  readonly indicadores: IndicadorOpcion[] = [
    { valor: 'PIB', texto: 'PIB' },
    { valor: 'INFLACION', texto: 'Inflación' },
    { valor: 'DESEMPLEO', texto: 'Desempleo' },
    { valor: 'DEUDA_PIB', texto: 'Deuda / PIB' },
    { valor: 'PIB_PERCAPITA', texto: 'PIB per cápita' },
    { valor: 'BALANZA_COMERCIAL', texto: 'Balanza comercial' }
  ];
  readonly colores = ['#4053b5', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6'];
  readonly maxPaises = 5;

  public indicadorSeleccionado: TipoIndicador = 'PIB';
  public paisesDisponibles: PaisOpcion[] = [];
  public codigosSeleccionados: string[] = [];
  public isLoading = true;
  public error = false;
  public sinDatos = false;
  public anios: number[] = [];

  private chart: Chart<'line', (number | null)[], string> | null = null;
  private solicitudActual = 0;
  private destruido = false;

  constructor(
    private riesgoService: RiesgoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    void this.inicializar();
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.solicitudActual++;
    this.chart?.destroy();
    this.chart = null;
  }

  private async inicializar(): Promise<void> {
    try {
      const paises = await this.riesgoService.getDatosMapa();
      if (this.destruido) return;

      this.paisesDisponibles = paises
        .map(pais => ({ codigo_iso: pais.codigo_iso, nombre: pais.nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      const preferidos = ['CO', 'BR', 'MX'];
      const disponibles = new Set(this.paisesDisponibles.map(pais => pais.codigo_iso));
      this.codigosSeleccionados = preferidos.filter(iso => disponibles.has(iso));
      if (this.codigosSeleccionados.length === 0) {
        this.codigosSeleccionados = this.paisesDisponibles.slice(0, 3).map(pais => pais.codigo_iso);
      }

      await this.cargarTendencias();
    } catch (error) {
      console.error('Error preparando gráfico de tendencias:', error);
      if (!this.destruido) {
        this.error = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  cambiarIndicador(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value as TipoIndicador;
    if (!this.indicadores.some(item => item.valor === valor)) return;
    this.indicadorSeleccionado = valor;
    void this.cargarTendencias();
  }

  estaSeleccionado(iso: string): boolean {
    return this.codigosSeleccionados.includes(iso);
  }

  alternarPais(iso: string): void {
    if (this.estaSeleccionado(iso)) {
      this.codigosSeleccionados = this.codigosSeleccionados.filter(codigo => codigo !== iso);
    } else if (this.codigosSeleccionados.length < this.maxPaises) {
      this.codigosSeleccionados = [...this.codigosSeleccionados, iso];
    } else {
      return;
    }
    void this.cargarTendencias();
  }

  async cargarTendencias(): Promise<void> {
    const solicitud = ++this.solicitudActual;
    this.chart?.destroy();
    this.chart = null;
    this.error = false;
    this.sinDatos = false;
    this.anios = [];

    if (this.codigosSeleccionados.length === 0) {
      this.isLoading = false;
      this.sinDatos = true;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const respuesta = await this.riesgoService.getTendencias(
        this.indicadorSeleccionado, this.codigosSeleccionados
      );
      if (this.destruido || solicitud !== this.solicitudActual) return;

      this.anios = respuesta.anios;
      const contieneValores = respuesta.series.some(
        serie => serie.valores.some(valor => valor !== null && Number.isFinite(Number(valor)))
      );
      this.sinDatos = !contieneValores;
      this.isLoading = false;
      this.cdr.detectChanges();

      if (contieneValores) this.dibujarGrafico(respuesta);
    } catch (error) {
      console.error('Error consultando tendencias:', error);
      if (this.destruido || solicitud !== this.solicitudActual) return;
      this.error = true;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private dibujarGrafico(respuesta: TendenciasResponse): void {
    const datasets = respuesta.series.map((serie, i) => ({
      label: serie.nombre,
      data: serie.valores.map(valor => {
        if (valor === null || valor === undefined) return null;
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : null;
      }),
      borderColor: this.colores[i % this.colores.length],
      backgroundColor: this.colores[i % this.colores.length],
      tension: 0.25,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      spanGaps: false
    }));

    this.chart = new Chart<'line', (number | null)[], string>(this.canvasTendencias.nativeElement, {
      type: 'line',
      data: {
        labels: respuesta.anios.map(String),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: context => {
                const valor = context.parsed.y;
                return `${context.dataset.label}: ${valor === null ? 'Sin datos' :
                  valor.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Año' }, grid: { display: false } },
          y: {
            title: { display: true, text: 'Valor del indicador' },
            ticks: {
              callback: value => Number(value).toLocaleString('es-CO', {
                notation: 'compact', maximumFractionDigits: 1
              })
            }
          }
        }
      }
    });
  }
}
