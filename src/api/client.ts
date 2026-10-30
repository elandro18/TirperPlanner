const bruto = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BASE = bruto ? bruto.replace(/\/+$/, '') : '/api/v1';
const TOKEN_KEY = 'trip-planner:token';

export interface ApiErro {
  id: string;
  message: string;
  field: string | null;
  detail: string | null;
}

export class HttpError extends Error {
  readonly status: number;
  readonly erros: ApiErro[];

  constructor(status: number, erros: ApiErro[]) {
    super(erros[0]?.message ?? 'Erro inesperado');
    this.name = 'HttpError';
    this.status = status;
    this.erros = erros;
  }
}

export function obterToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function definirToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* armazenamento indisponível */
  }
}

export function limparToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* armazenamento indisponível */
  }
}

/** Executa uma chamada à API com Bearer e envelope de erro do backend. */
export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = obterToken();
  const headers = new Headers(opcoes.headers);
  if (opcoes.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(`${BASE}${caminho}`, { ...opcoes, headers });
  if (resposta.status === 204) {
    return undefined as T;
  }

  const corpo = (await resposta.json().catch(() => null)) as unknown;
  if (!resposta.ok) {
    const erros: ApiErro[] = Array.isArray(corpo)
      ? (corpo as ApiErro[])
      : [{ id: 'ERR-000', message: 'Erro inesperado', field: null, detail: null }];
    if (resposta.status === 401) {
      limparToken();
    }
    throw new HttpError(resposta.status, erros);
  }

  return corpo as T;
}

/** Percorre todas as páginas de uma listagem offset. */
export async function listarTudo<T>(caminho: string): Promise<T[]> {
  const tamanho = 100;
  let pagina = 0;
  const itens: T[] = [];

  for (;;) {
    const separador = caminho.includes('?') ? '&' : '?';
    const resposta = await api<{
      content: T[];
      totalPages: number;
    }>(`${caminho}${separador}page=${pagina}&size=${tamanho}`);
    itens.push(...resposta.content);
    if (pagina + 1 >= resposta.totalPages) {
      break;
    }
    pagina += 1;
  }

  return itens;
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpError) {
    return erro.erros.map((item) => item.message).join(' ');
  }
  if (erro instanceof TypeError && /fetch/i.test(erro.message)) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
  }
  if (erro instanceof Error) {
    return erro.message;
  }
  return 'Erro inesperado. Tente novamente.';
}
