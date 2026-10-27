import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Compass, FileUp, Plus } from 'lucide-react'
import { useTrip } from '../store/TripStore'
import { useViagemAlvo } from '../hooks/useViagemAlvo'
import { PageHeader } from '../components/layout/PageHeader'
import { FormPassagem } from '../components/forms/FormPassagem'
import { PainelSalvo } from '../components/forms/PainelSalvo'
import { EscolherTipoSheet } from '../components/sheets/EscolherTipoSheet'
import { ImportarPassagemSheet } from '../components/sheets/ImportarPassagemSheet'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { PassagemCard } from '../components/cards/PassagemCard'
import type { TripPassagem } from '../types'

export function CadastroPassagem() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const viagem = useViagemAlvo()
  const editarId = params.get('editar')
  const editando = editarId
    ? state.passagens.find((p) => p.id === editarId)
    : undefined

  const [salvo, setSalvo] = useState<TripPassagem | null>(null)
  const [escolherTipo, setEscolherTipo] = useState(false)
  const [importarAberto, setImportarAberto] = useState(false)

  if (!viagem) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Escolha uma viagem primeiro"
        descricao="Uma passagem pertence a uma viagem. Crie a viagem e volte para cadastrar."
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
        titulo={editando ? 'Editar passagem' : 'Nova passagem'}
        subtitulo="Um trecho de transporte por vez. Importe o comprovante ou preencha manualmente."
        acao={
          <Button
            variante="creme"
            icone={<FileUp size={16} />}
            onClick={() => setImportarAberto(true)}
          >
            Importar PDF/imagem
          </Button>
        }
      />

      {salvo ? (
        <>
          <div className="mb-5">
            <PassagemCard passagem={salvo} />
          </div>
          <PainelSalvo
            titulo="Passagem salva"
            descricao="A passagem já está no inventário. Você pode vinculá-la ao dia da partida no roteiro."
            rotuloAdicionarOutro="Adicionar outro item"
            onAdicionarOutro={() => setEscolherTipo(true)}
            onOrganizar={() => navigate('/planejamento')}
          />
        </>
      ) : (
        <FormPassagem
          viagemId={viagem.id}
          item={editando}
          onSalvo={(p) => {
            if (editando) {
              navigate('/planejamento')
              return
            }
            const diaId = params.get('dia')
            if (diaId && viagem) {
              dispatch({
                type: 'ADD_ROTEIRO',
                entrada: {
                  id: `r-PASSAGEM-${p.id}-${diaId}`,
                  viagemId: viagem.id,
                  diaId,
                  tipoItem: 'PASSAGEM',
                  itemId: p.id,
                },
              })
              navigate('/roteiro')
              return
            }
            setSalvo(p)
          }}
        />
      )}

      <EscolherTipoSheet
        aberto={escolherTipo}
        viagemId={viagem.id}
        aoFechar={() => setEscolherTipo(false)}
      />

      <ImportarPassagemSheet
        aberto={importarAberto}
        viagemId={viagem.id}
        aoFechar={() => setImportarAberto(false)}
        onSalvo={(passagem) => setSalvo(passagem)}
      />
    </div>
  )
}
