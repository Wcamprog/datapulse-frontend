import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Paises as PaisesApiService } from '../../../core/services/pais';
import { Alerta as AlertaService } from '../../../core/services/alerta';

interface Pais {
  codigo_iso: string;
  nombre: string;
  moneda_codigo: string;
  moneda_nombre: string;
}

@Component({
  selector: 'app-lista-paises',
  templateUrl: './lista-paises.html',
  styleUrls: ['./lista-paises.css'],
  standalone: false
})
export class ListaPaises implements OnInit {
  displayedColumns = ['codigo_iso', 'nombre', 'moneda', 'acciones'];
  dataSource: Pais[] = [];
  isLoading: boolean = false;
  isSyncing: boolean = false;

  isModalOpen: boolean = false;
  paisSeleccionado: any = null;
  public isCrearPaisOpen: boolean = false;

  constructor(
    private paisesService: PaisesApiService,
    private alertaService: AlertaService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.cargarPaises();
  }

  async cargarPaises(): Promise<void> {
    try {
      this.isLoading = true;
      this.dataSource = await this.paisesService.getPaises();
    } catch (error) {
      console.error('Error al cargar países', error);
      this.alertaService.show('Error al cargar la lista de países.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async sincronizar(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      const response = await this.paisesService.sincronizarIndicadores();
      this.alertaService.show( response.mensaje ?? response.error, response.mensaje ? 'success' : 'error');
      await this.cargarPaises();
    } catch (error) {
      console.error('Error al sincronizar indicadores', error);
      this.alertaService.show('Ocurrió un error al sincronizar los indicadores.', 'error');
    } finally {
      this.isSyncing = false;
      this.cdr.detectChanges();
    }
  }

  verIndicadores(pais: any): void {
    this.paisSeleccionado = pais;
    this.isModalOpen = true;
    this.cdr.detectChanges();

  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.paisSeleccionado = null;
    this.cdr.detectChanges();
  }

  abrirCrearPais(): void {
    this.isCrearPaisOpen = true;
    this.cdr.detectChanges();
  }

  onModalCrearPaisClosed(guardado: boolean): void {
    this.isCrearPaisOpen = false;
    this.cdr.detectChanges();
    if (guardado) {
      this.cargarPaises();
    }
  }
}