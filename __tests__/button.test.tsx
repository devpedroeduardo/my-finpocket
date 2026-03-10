import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Componente de Botão (UI)', () => {
  it('deve renderizar o botão com o texto correto', () => {
    // 1. Prepara (Renderiza o componente isolado)
    render(<Button>Clique Aqui</Button>)

    // 2. Age (Procura o botão pelo texto)
    const button = screen.getByText('Clique Aqui')

    // 3. Afirma (Garante que ele está na tela de verdade)
    expect(button).toBeInTheDocument()
  })
})