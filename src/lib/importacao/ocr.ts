export async function extrairTextoImagem(imagem: Blob): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('por')

  try {
    const { data } = await worker.recognize(imagem)
    return data.text
  } finally {
    await worker.terminate()
  }
}
