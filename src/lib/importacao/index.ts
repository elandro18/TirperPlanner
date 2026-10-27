import { tipoDocumento, validarArquivo, type TipoDocumento } from './arquivo'
import { extrairTextoImagem } from './ocr'
import { extrairTextoPdf, renderizarPdfEmImagens } from './pdf'

export interface ResultadoExtracao {
  texto: string
  tipo: TipoDocumento
}

export async function extrairDocumento(file: File): Promise<ResultadoExtracao> {
  const erro = validarArquivo(file)
  if (erro) throw new Error(erro)

  const tipo = tipoDocumento(file)
  if (!tipo) throw new Error('Formato de arquivo não suportado.')

  let texto =
    tipo === 'pdf'
      ? await extrairTextoPdf(file)
      : await extrairTextoImagem(file)

  if (tipo === 'pdf' && texto.trim().length < 20) {
    const imagens = await renderizarPdfEmImagens(file)
    if (imagens.length) {
      const partes: string[] = []
      for (const imagem of imagens) {
        partes.push(await extrairTextoImagem(imagem))
      }
      texto = partes.join('\n')
    }
  }

  if (!texto.trim()) {
    throw new Error(
      'Não foi possível ler o documento. Tente outro arquivo ou preencha a passagem manualmente.',
    )
  }

  return { texto, tipo }
}
