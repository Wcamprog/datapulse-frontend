export function getFechaHoyColombia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export function formatFechaColombia(fecha: Date = new Date()): string {
  return fecha.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}