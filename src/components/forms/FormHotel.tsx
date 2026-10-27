import { useMemo, useState } from 'react'
import { MoonStar, Save } from 'lucide-react'
import type { GeoStatus, ID, TripHotel } from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { foto } from '../../data/seed'
import type { Coordenada } from '../../lib/geocode'
import { diasEntre, formatMoeda, plural } from '../../lib/format'
import { Campo, Entrada, LinhaCampos } from '../ui/Field'
import { Button } from '../ui/Button'
import { CampoEndereco } from './CampoEndereco'

interface Props {
  viagemId: ID
  item?: TripHotel
  rotuloAcao?: string
  /** quando true, não renderiza o botão de salvar (fica no rodapé do modal) */
  acoesExternas?: boolean
  formId?: string
  onSalvo: (hotel: TripHotel) => void
}

const paraInput = (iso?: string) => (iso ? iso.slice(0, 16) : '')
const paraISO = (v: string) => (v && v.length === 16 ? `${v}:00` : v)

export function FormHotel({
  viagemId,
  item,
  rotuloAcao = 'Salvar hospedagem',
  acoesExternas,
  formId,
  onSalvo,
}: Props) {
  const { dispatch } = useTrip()
  const [nome, setNome] = useState(item?.nome ?? '')
  const [endereco, setEndereco] = useState(item?.endereco ?? '')
  const [cidade, setCidade] = useState(item?.cidade ?? '')
  const [coords, setCoords] = useState<Coordenada | undefined>(
    item?.lat != null && item?.lng != null
      ? { lat: item.lat, lng: item.lng }
      : undefined,
  )
  const [geoStatus, setGeoStatus] = useState<GeoStatus | undefined>(item?.geoStatus)
  const [checkin, setCheckin] = useState(paraInput(item?.checkin))
  const [checkout, setCheckout] = useState(paraInput(item?.checkout))
  const [valorNoite, setValorNoite] = useState(
    item?.valorNoite != null ? String(item.valorNoite) : '',
  )
  const [valorTotal, setValorTotal] = useState(
    item?.valorTotal != null ? String(item.valorTotal) : '',
  )
  const [codigoReserva, setCodigo] = useState(item?.codigoReserva ?? '')
  const [erros, setErros] = useState<Record<string, string>>({})

  const noites = useMemo(() => {
    if (!checkin || !checkout) return 0
    return Math.max(0, diasEntre(checkin.slice(0, 10), checkout.slice(0, 10)))
  }, [checkin, checkout])

  const totalCalculado =
    valorTotal.trim() !== ''
      ? Number(valorTotal.replace(',', '.'))
      : Number(valorNoite.replace(',', '.') || 0) * noites

  function salvar() {
    const novos: Record<string, string> = {}
    if (!nome.trim()) novos.nome = 'Informe o nome da hospedagem'
    if (!checkin) novos.checkin = 'Informe o check-in'
    if (!checkout) novos.checkout = 'Informe o check-out'
    if (checkin && checkout && diasEntre(checkin.slice(0, 10), checkout.slice(0, 10)) <= 0)
      novos.checkout = 'O check-out deve ser depois do check-in'
    setErros(novos)
    if (Object.keys(novos).length) return

    const hotel: TripHotel = {
      id: item?.id ?? uid('h'),
      viagemId,
      nome: nome.trim(),
      endereco: endereco.trim() || undefined,
      cidade: cidade.trim() || undefined,
      checkin: paraISO(checkin),
      checkout: paraISO(checkout),
      valorNoite: valorNoite.trim() === '' ? undefined : Number(valorNoite.replace(',', '.')),
      noites,
      valorTotal: totalCalculado || undefined,
      codigoReserva: codigoReserva.trim() || undefined,
      fotoUrl: item?.fotoUrl ?? foto(nome.trim() || 'hotel', 900, 700),
      lat: coords?.lat,
      lng: coords?.lng,
      geoStatus: coords ? geoStatus : undefined,
    }
    if (item) dispatch({ type: 'UPDATE_HOTEL', id: item.id, patch: hotel })
    else dispatch({ type: 'ADD_HOTEL', hotel })
    onSalvo(hotel)
  }

  return (
    <form
      id={formId}
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        salvar()
      }}
    >
      <Campo rotulo="Nome da hospedagem" obrigatorio erro={erros.nome}>
        <Entrada
          value={nome}
          erro={!!erros.nome}
          placeholder="Ex.: Hotel Vila Verde"
          onChange={(e) => setNome(e.target.value)}
        />
      </Campo>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Localização
        </legend>
        <CampoEndereco
          endereco={endereco}
          cidade={cidade}
          coords={coords}
          geoStatus={geoStatus}
          onEnderecoChange={setEndereco}
          onCidadeChange={setCidade}
          onCoordsChange={(c, status) => {
            setCoords(c)
            setGeoStatus(status)
          }}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Período
        </legend>
        <LinhaCampos>
          <Campo rotulo="Check-in" obrigatorio erro={erros.checkin}>
            <Entrada
              type="datetime-local"
              value={checkin}
              erro={!!erros.checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Check-out" obrigatorio erro={erros.checkout}>
            <Entrada
              type="datetime-local"
              value={checkout}
              erro={!!erros.checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </Campo>
        </LinhaCampos>

        <div className="flex items-center gap-2 rounded-2xl bg-sage-100 px-3.5 py-2.5 text-[13px] font-semibold text-forest-800">
          <MoonStar size={16} />
          {noites} {plural(noites, 'noite', 'noites')} · vigora em{' '}
          {noites} {plural(noites, 'dia', 'dias')} do roteiro
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Valores
        </legend>
        <LinhaCampos>
          <Campo rotulo="Valor por noite (R$)">
            <Entrada
              type="number"
              min={0}
              inputMode="decimal"
              value={valorNoite}
              placeholder="0"
              onChange={(e) => setValorNoite(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Valor total (R$)" dica="Deixe vazio para calcular">
            <Entrada
              type="number"
              min={0}
              inputMode="decimal"
              value={valorTotal}
              placeholder={String(Number(valorNoite || 0) * noites || '')}
              onChange={(e) => setValorTotal(e.target.value)}
            />
          </Campo>
        </LinhaCampos>
        <div className="flex items-center justify-between rounded-2xl border border-forest-700/15 bg-forest-700/5 px-3.5 py-3">
          <span className="text-[13px] font-semibold text-forest-800">
            Total da hospedagem
          </span>
          <span className="font-display text-xl text-forest-900">
            {formatMoeda(totalCalculado)}
          </span>
        </div>
      </fieldset>

      <Campo rotulo="Código da reserva">
        <Entrada
          value={codigoReserva}
          placeholder="Ex.: EXEMPLO-0000"
          onChange={(e) => setCodigo(e.target.value)}
        />
      </Campo>

      {acoesExternas ? null : (
        <Button type="submit" bloco tamanho="lg" icone={<Save size={17} />}>
          {rotuloAcao}
        </Button>
      )}
    </form>
  )
}
