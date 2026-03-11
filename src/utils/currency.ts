export function formatCentsToReal(cents: number): string {
  const reais = cents / 100;
  
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}