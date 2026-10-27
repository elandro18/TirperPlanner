import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Compass, Plus } from 'lucide-react'
import { useTrip } from '../store/TripStore'
import { useViagemAlvo } from '../hooks/useViagemAlvo'
import { PageHeader } from '../components/layout/PageHeader'
import { FormLocal } from '../components/forms/FormLocal'
import { PainelSalvo } from '../components/forms/PainelSalvo'
import { EscolherTipoSheet } from '../components/sheets/EscolherTipoSheet'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import type { TripLocal } from '../types'

export function CadastroLocal() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const viagem = useViagemAlvo()
  const editarId = params.get('editar')
  const editando = editarId ? state.locais.find((l) => l.id === editarId) : undefined

  const [salvo, setSalvo] = useState<TripLocal | null>(null)
  const [escolherTipo, setEscolherTipo] = useState(false)

  if (!viagem) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Escolha uma viagem primeiro"
        descricao="Um local pertence a uma viagem. Crie a viagem e volte para cadastrar."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        sobre="Cadastro"
        titulo={editando ? 'Editar local' : 'Novo local'}
        subtitulo="Pontos turísticos, museus, restaurantes, natureza, compras, passeios e experiências culturais são registros de local."
      />

      {salvo ? (
        <PainelSalvo
          titulo="Local salvo"
          descricao={`“${salvo.nome}” já está no inventário da viagem. Agora você pode organizá-lo em um dia do roteiro — ou seguir cadastrando.`}
          rotuloAdicionarOutro="Adicionar outro item"
          onAdicionarOutro={() => setEscolherTipo(true)}
          onOrganizar={() => navigate('/planejamento')}
        />
      ) : (
        <FormLocal
          viagemId={viagem.id}
          item={editando}
          onSalvo={(local) => {
            if (editando) {
              navigate('/planejamento')
              return
            }
            const diaId = params.get('dia')
            if (diaId && viagem) {
              dispatch({
                type: 'ADD_ROTEIRO',
                entrada: {
                  id: `r-LOCAL-${local.id}-${diaId}`,
                  viagemId: viagem.id,
                  diaId,
                  tipoItem: 'LOCAL',
                  itemId: local.id,
                },
              })
              navigate('/roteiro')
              return
            }
            setSalvo(local)
          }}
        />
      )}

      <EscolherTipoSheet
        aberto={escolherTipo}
        viagemId={viagem.id}
        aoFechar={() => setEscolherTipo(false)}
      />
    </div>
  )
}
