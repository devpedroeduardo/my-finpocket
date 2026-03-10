import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input' // Caminho padrão do shadcn/ui

describe('Componente de Input (Formulário)', () => {
  it('deve atualizar o valor corretamente quando o usuário digita', async () => {
    // 1. Prepara: Inicializa o "robô" que simula o usuário
    const user = userEvent.setup()

    // Renderiza o input isolado com um placeholder para acharmos ele
    render(<Input placeholder="Digite seu e-mail" />)

    // Busca o input na tela pelo placeholder
    const inputElement = screen.getByPlaceholderText('Digite seu e-mail')

    // 2. Age: O "robô" clica no input e digita o e-mail tecla por tecla
    await user.type(inputElement, 'pedro@email.com')

    // 3. Afirma: Garante que o valor que está dentro do input agora é o e-mail digitado
    expect(inputElement).toHaveValue('pedro@email.com')
  })
})