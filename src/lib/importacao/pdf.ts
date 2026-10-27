async function carregarPdf(file: File) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (
    await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  ).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const carregando = pdfjs.getDocument({
    data: await file.arrayBuffer(),
  })
  const documento = await carregando.promise

  return { documento, destruir: () => carregando.destroy() }
}

export async function extrairTextoPdf(file: File): Promise<string> {
  const { documento, destruir } = await carregarPdf(file)

  try {
    const textos: string[] = []
    const total = Math.min(documento.numPages, 20)

    for (let numero = 1; numero <= total; numero++) {
      const pagina = await documento.getPage(numero)
      const conteudo = await pagina.getTextContent()
      const partes = conteudo.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)

      if (partes.length) textos.push(partes.join(' '))
    }

    return textos.join('\n')
  } finally {
    await destruir()
  }
}

export async function renderizarPdfEmImagens(
  file: File,
  maxPaginas = 3,
): Promise<Blob[]> {
  const { documento, destruir } = await carregarPdf(file)

  try {
    const imagens: Blob[] = []
    const total = Math.min(documento.numPages, maxPaginas)

    for (let numero = 1; numero <= total; numero++) {
      const pagina = await documento.getPage(numero)
      const viewport = pagina.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)

      await pagina.render({ canvas, viewport }).promise

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      )
      if (blob) imagens.push(blob)
    }

    return imagens
  } finally {
    await destruir()
  }
}
