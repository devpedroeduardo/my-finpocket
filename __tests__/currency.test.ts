import { formatCentsToReal } from '@/utils/currency'

describe('Utilitários Financeiros (currency.ts)', () => {
  
  it('deve converter 1500 centavos perfeitamente para R$ 15,00', () => {
    // 1. Executa a função
    const resultado = formatCentsToReal(1500).replace(/\s/g, ' ');

    // 2. Afirma o resultado
    expect(resultado).toBe('R$ 15,00');
  });

  it('deve formatar corretamente o valor zero', () => {
    const resultado = formatCentsToReal(0).replace(/\s/g, ' ');
    expect(resultado).toBe('R$ 0,00');
  });

  it('deve colocar os pontos de milhar corretamente', () => {
    // 125.000 centavos devem virar R$ 1.250,00
    const resultado = formatCentsToReal(125000).replace(/\s/g, ' ');
    expect(resultado).toBe('R$ 1.250,00');
  });

});