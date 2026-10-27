import { useState } from 'react'
import { ListTodo } from 'lucide-react'
import type { TripLista } from '../../types'
import { LISTA_CATEGORIAS_SUGERIDAS } from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { viagemAtiva } from '../../lib/derive'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Campo, Entrada, Selecao } from '../ui/Field'

interface Props {
  aberto: boolean
  lista?: TripLista | null
  aoFechar: () => void
  onSalvo?: (lista: TripLista) => void
}

export function ListaFormSheet({ aberto, lista, aoFechar, onSalvo }: Props) {
  const { state, dispatch } = useTrip()
  const [nome, setNome] = useState(lista?.nome ?? '')
  const [categoria, setCategoria] = useState(lista?.categoria ?? '')
  const [viagemId, setViagemId] = useState(
    lista?.viagemId ?? viagemAtiva(state)?.id ?? '',
  )
  const [erros, setErros] = useState<Record<string, string>>({})

  if (!aberto) return null

  const viagemVinculada = state.viagens.find((v) => v.id === lista?.viagemId)
  const semViagens = state.viagens.length === 0

  function salvar() {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Dê um nome para a lista'
    if (!categoria.trim()) e.categoria = 'Informe ou escolha uma categoria'
    if (!lista && !viagemId) e.viagemId = 'Selecione a viagem'
    setErros(e)
    if (Object.keys(e).length) return

    if (lista) {
      const atualizada: TripLista = {
        ...lista,
        nome: nome.trim(),
        categoria: categoria.trim(),
      }
      dispatch({ type: 'UPDATE_LISTA', id: lista.id, patch: atualizada })
      onSalvo?.(atualizada)
    } else {
      const nova: TripLista = {
        id: uid('ls'),
        usuarioId: state.usuario.id,
        viagemId,
        nome: nome.trim(),
        categoria: categoria.trim(),
        criadaEm: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_LISTA', lista: nova })
      onSalvo?.(nova)
    }
    aoFechar()
  }

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={lista ? 'Editar lista' : 'Nova lista'}
      subtitulo="Listas são independentes do roteiro diário."
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            bloco
            className="sm:w-auto"
            icone={<ListTodo size={16} />}
            disabled={!lista && semViagens}
            onClick={salvar}
          >
            {lista ? 'Salvar alterações' : 'Criar lista'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Campo rotulo="Nome da lista" obrigatorio erro={erros.nome}>
          <Entrada
            value={nome}
            erro={!!erros.nome}
            placeholder="Ex.: Documentos da viagem"
            onChange={(e) => {
              setNome(e.target.value)
              if (erros.nome) setErros((x) => ({ ...x, nome: '' }))
            }}
          />
        </Campo>

        <Campo
          rotulo="Categoria"
          obrigatorio
          erro={erros.categoria}
          dica="Escolha uma sugestão ou digite a sua"
        >
          <>
            <Entrada
              value={categoria}
              erro={!!erros.categoria}
              list="categorias-lista"
              placeholder="Ex.: Documentos, Roupas, Brinquedos…"
              onChange={(e) => {
                setCategoria(e.target.value)
                if (erros.categoria) setErros((x) => ({ ...x, categoria: '' }))
              }}
            />
            <datalist id="categorias-lista">
              {LISTA_CATEGORIAS_SUGERIDAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>
        </Campo>

        {lista ? (
          <Campo rotulo="Viagem">
            <Entrada
              value={viagemVinculada?.nome ?? 'Sem vínculo'}
              disabled
              readOnly
            />
          </Campo>
        ) : semViagens ? (
          <p className="rounded-2xl bg-clay-100 px-3.5 py-3 text-[12px] font-semibold leading-relaxed text-clay-700">
            Crie uma viagem antes de criar listas — toda lista precisa estar
            vinculada a uma viagem.
          </p>
        ) : (
          <Campo rotulo="Viagem" obrigatorio erro={erros.viagemId}>
            <Selecao
              value={viagemId}
              erro={!!erros.viagemId}
              onChange={(e) => {
                setViagemId(e.target.value)
                if (erros.viagemId) {
                  setErros((anteriores) => ({
                    ...anteriores,
                    viagemId: '',
                  }))
                }
              }}
            >
              <option value="">Selecione a viagem</option>
              {state.viagens.map((viagem) => (
                <option key={viagem.id} value={viagem.id}>
                  {viagem.nome}
                  {viagem.ativa ? ' (ativa)' : ''}
                </option>
              ))}
            </Selecao>
          </Campo>
        )}

        <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
          Use as listas para checklists de documentos, roupas, eletrônicos,
          brinquedos e o que mais precisar levar.
        </p>
      </div>
    </Sheet>
  )
}
