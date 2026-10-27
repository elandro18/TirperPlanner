import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Compass, Plus } from 'lucide-react'
import { useTrip } from '../store/TripStore'
import { useViagemAlvo } from '../hooks/useViagemAlvo'
import { diasDaViagem } from '../lib/derive'
import { PageHeader } from '../components/layout/PageHeader'
import { FormHotel } from '../components/forms/FormHotel'
import { PainelSalvo } from '../components/forms/PainelSalvo'
import { EscolherTipoSheet } from '../components/sheets/EscolherTipoSheet'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { HotelCard } from '../components/cards/HotelCard'
import type { TripHotel } from '../types'

export function CadastroHotel() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const viagem = useViagemAlvo()
  const editarId = params.get('editar')
  const editando = editarId ? state.hoteis.find((h) => h.id === editarId) : undefined

  const [salvo, setSalvo] = useState<TripHotel | null>(null)
  const [escolherTipo, setEscolherTipo] = useState(false)

  if (!viagem) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Escolha uma viagem primeiro"
        descricao="Uma hospedagem pertence a uma viagem. Crie a viagem e volte para cadastrar."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  const dias = diasDaViagem(state, viagem.id)

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        sobre="Cadastro"
        titulo={editando ? 'Editar hospedagem' : 'Nova hospedagem'}
        subtitulo="Informe o período: a hospedagem aparece em todos os dias em que estiver vigente, sem duplicar o registro."
      />

      {salvo ? (
        <>
          <div className="mb-5">
            <HotelCard hotel={salvo} dias={dias} />
          </div>
          <PainelSalvo
            titulo="Hospedagem salva"
            descricao="Ao organizar no roteiro, ela aparece em cada dia do período como um card vinculado ao mesmo registro."
            rotuloAdicionarOutro="Adicionar outro item"
            onAdicionarOutro={() => setEscolherTipo(true)}
            onOrganizar={() => navigate('/planejamento')}
          />
        </>
      ) : (
        <FormHotel
          viagemId={viagem.id}
          item={editando}
          onSalvo={(h) => {
            if (editando) {
              navigate('/planejamento')
              return
            }
            if (params.get('dia')) {
              dispatch({ type: 'ADD_HOTEL_AOS_DIAS', hotelId: h.id })
              navigate('/roteiro')
              return
            }
            setSalvo(h)
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
