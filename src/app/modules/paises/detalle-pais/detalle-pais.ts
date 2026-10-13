import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Paises as PaisesService } from '../../../core/services/pais';
import { Alerta as AlertaService } from '../../../core/services/alerta';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-detalle-pais',
  templateUrl: './detalle-pais.html',
  styleUrls: ['./detalle-pais.css'],
  standalone: false
})
export class DetallePais implements OnInit, AfterViewInit {
  codigoIso: string = '';
  pais: any = null;
  isLoading: boolean = true;

  @ViewChild('graficoIndicadoresCanvas') graficoIndicadoresCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoCambioCanvas') graficoCambioCanvas!: ElementRef<HTMLCanvasElement>;

  chartIndicadores: Chart | null = null;
  chartTipoCambio: Chart | null = null;

  historicoCambio: any[] = [];
  historicoIrpc: any[] = [];
  indicadoresActuales: { [key: string]: { valor: number; anio: number } } = {};

  riesgo = {
    economico: 0,
    cambiario: 0,
    estabilidad: 0,
    compuesto: 0,
    nivel: 'BAJO'
  };

  displayedColumnsIrpc: string[] = ['periodo', 'score_economico', 'score_cambiario', 'score_estabilidad', 'indice_compuesto', 'nivel_riesgo'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paisesService: PaisesService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.codigoIso = this.route.snapshot.paramMap.get('codigo_iso') || '';
    if (!this.codigoIso) {
      this.router.navigate(['/dashboard/listar-paises']);
      return;
    }
    await this.cargarInformacion();
  }

  ngAfterViewInit(): void {
    if (!this.isLoading) {
      this.iniciarGraficos();
    }
  }

  getBanderaUrl(): string {
    return `https://flagcdn.com/w160/${this.codigoIso.toLowerCase()}.png`;
  }

  async cargarInformacion(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      this.pais = await this.paisesService.getPaisByIso(this.codigoIso);
      if (this.pais?.indicadores && Array.isArray(this.pais.indicadores)) {
        this.procesarIndicadores(this.pais.indicadores);
      }

      try {
        const cambios = await this.paisesService.getHistoricoTipoCambio(this.codigoIso);
        const lista = Array.isArray(cambios) ? cambios : (cambios?.results || []);
        this.historicoCambio = lista.sort(
          (a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
      } catch (err) {
        this.historicoCambio = [];
      }

      const registrosRiesgo = await this.paisesService.getHistoricoRiesgo(this.codigoIso);
      this.procesarRiesgo(registrosRiesgo);

    } catch (error) {
      this.alerta.show('No fue posible cargar el detalle del país.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.iniciarGraficos(), 100);
    }
  }

  private procesarIndicadores(indicadores: any[]): void {
    this.indicadoresActuales = {};
    const ordenados = [...indicadores].sort((a, b) => (Number(b.anio) || 0) - (Number(a.anio) || 0));

    ordenados.forEach(ind => {
      const tipo = ind.tipo;
      if (tipo && !this.indicadoresActuales[tipo]) {
        this.indicadoresActuales[tipo] = {
          valor: parseFloat(ind.valor),
          anio: ind.anio
        };
      }
    });
  }

  private procesarRiesgo(registros: any[]): void {
    if (!registros || registros.length === 0) {
      return;
    }

    const actual = registros[0];
    this.riesgo = {
      economico: Number(actual.score_economico || 0),
      cambiario: Number(actual.score_cambiario || 0),
      estabilidad: Number(actual.score_estabilidad || 0),
      compuesto: Number(actual.indice_compuesto || 0),
      nivel: (actual.nivel_riesgo || 'BAJO').toUpperCase()
    };

    this.historicoIrpc = registros.map(item => ({
      periodo: item.fecha_calculo || 'Actual',
      score_economico: Number(item.score_economico || 0),
      score_cambiario: Number(item.score_cambiario || 0),
      score_estabilidad: Number(item.score_estabilidad || 0),
      indice_compuesto: Number(item.indice_compuesto || 0),
      nivel_riesgo: (item.nivel_riesgo || 'BAJO').toUpperCase()
    }));
  }

  private iniciarGraficos(): void {
    this.crearGraficoIndicadores();
    this.crearGraficoTipoCambio();
  }

  private crearGraficoIndicadores(): void {
    if (!this.graficoIndicadoresCanvas) return;
    if (this.chartIndicadores) this.chartIndicadores.destroy();

    const indicadores = this.pais?.indicadores || [];
    if (indicadores.length === 0) return;

    const anios: number[] = Array.from(new Set(indicadores.map((i: any) => Number(i.anio))))
      .filter(a => !isNaN(a as number))
      .sort((a, b) => ( a as number) - (b as number)) as number[];

    const extraerSerie = (tipo: string) => {
      return anios.map(a => {
        const item = indicadores.find((i: any) => Number(i.anio) === a && i.tipo === tipo);
        return item ? parseFloat(item.valor) : null;
      });
    };

    const ctx = this.graficoIndicadoresCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartIndicadores = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: anios.map(String),
        datasets: [
          {
            label: 'Inflación (%)',
            data: extraerSerie('INFLACION'),
            backgroundColor: 'rgba(239, 68, 68, 0.75)',
            borderRadius: 4
          },
          {
            label: 'Desempleo (%)',
            data: extraerSerie('DESEMPLEO'),
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderRadius: 4
          },
          {
            label: 'Deuda / PIB (%)',
            data: extraerSerie('DEUDA_PIB'),
            backgroundColor: 'rgba(245, 158, 11, 0.75)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private crearGraficoTipoCambio(): void {
    if (!this.graficoCambioCanvas) return;
    if (this.chartTipoCambio) this.chartTipoCambio.destroy();

    const labels = this.historicoCambio.map(h => h.fecha);
    const tasas = this.historicoCambio.map(h => parseFloat(h.tasa));

    const ctx = this.graficoCambioCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartTipoCambio = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Sin registros'],
        datasets: [{
          label: `Tasa (${this.pais?.moneda_codigo || 'USD'} / USD)`,
          data: tasas.length ? tasas : [0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/listar-paises']);
  }
}