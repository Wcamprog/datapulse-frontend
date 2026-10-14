import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PaisMapa, Riesgo as RiesgoService } from '../../../core/services/riesgo';

@Component({
  selector: 'app-tabla-ranking',
  templateUrl: './tabla-ranking.html',
  styleUrls: ['./tabla-ranking.css'],
  standalone: false
})
export class TablaRanking implements OnInit {
  public paisesRanking: PaisMapa[] = [];
  public isLoading = true;
  public error = false;

  constructor(
    private riesgoService: RiesgoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.cargarRanking();
  }

  async cargarRanking(): Promise<void> {
    this.isLoading = true;
    this.error = false;
    try {
      const paises = await this.riesgoService.getDatosMapa();
      this.paisesRanking = paises
        .filter(pais => pais.irpc !== null && Number.isFinite(Number(pais.irpc)))
        .sort((a, b) => Number(b.irpc) - Number(a.irpc) || a.nombre.localeCompare(b.nombre))
        .slice(0, 10);
    } catch (error) {
      console.error('Error al obtener ranking IRPC:', error);
      this.paisesRanking = [];
      this.error = true;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  nombreNivel(nivel: string): string {
    const nombres: Record<string, string> = {
      BAJO: 'Bajo', MODERADO: 'Moderado', ALTO: 'Alto', CRITICO: 'Crítico'
    };
    return nombres[nivel] ?? 'Sin clasificación';
  }
}
