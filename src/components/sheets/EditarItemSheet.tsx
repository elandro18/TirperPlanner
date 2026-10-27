import { Save } from 'lucide-react'
import type { ID, RoteiroItemTipo } from '../../types'
import { ROTEIRO_TIPO_ROTULO } from '../../types'
import { useTrip } from '../../store/TripStore'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { FormLocal } from '../forms/FormLocal'
import { FormPassagem } from '../forms/FormPassagem'
import { FormHotel } from '../forms/FormHotel'

interface Props {
  tipo: RoteiroItemTipo | null
  itemId: ID | null
  viagemId: ID
  aoFechar: () => void
  onSalvo?: () => void
}

const FORM_ID = 'form-edicao-item'

/**
 * Edição de um registro em modal — o usuário permanece na página/seção de
 * origem (Task 7). Os formulários são os mesmos do cadastro, em modo edição.
 */
export function EditarItemSheet({
  tipo,
  itemId,
  viagemId,
  aoFechar,
  onSalvo,
}: Props) {
  const { state } = useTrip()
  const aberto = !!tipo && !!itemId
  if (!aberto || !tipo || !itemId) return null

  const titulo = `Editar ${ROTEIRO_TIPO_ROTULO[tipo].toLowerCase()}`
  const concluir = () => {
    onSalvo?.()
    aoFechar()
  }

  const local = tipo === 'LOCAL' ? state.locais.find((l) => l.id === itemId) : undefined
  const passagem =
    tipo === 'PASSAGEM' ? state.passagens.find((p) => p.id === itemId) : undefined
  const hotel = tipo === 'HOTEL' ? state.hoteis.find((h) => h.id === itemId) : undefined

  if (!local && !passagem && !hotel) return null

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      largura="lg"
      titulo={titulo}
      subtitulo="As alterações são salvas no registro original."
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" onClick={aoFechar} className="sm:w-auto" bloco>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            icone={<Save size={16} />}
            bloco
            className="sm:w-auto"
          >
            Salvar alterações
          </Button>
        </div>
      }
    >
      {local ? (
        <FormLocal
          viagemId={viagemId}
          item={local}
          acoesExternas
          formId={FORM_ID}
          onSalvo={concluir}
        />
      ) : passagem ? (
        <FormPassagem
          viagemId={viagemId}
          item={passagem}
          acoesExternas
          formId={FORM_ID}
          onSalvo={concluir}
        />
      ) : hotel ? (
        <FormHotel
          viagemId={viagemId}
          item={hotel}
          acoesExternas
          formId={FORM_ID}
          onSalvo={concluir}
        />
      ) : null}
    </Sheet>
  )
}
