import type { Decimal } from "@prisma/client/runtime/client.d.mts";

export type statusObra = "Planejando" | "Andamento" | "Pausada" | "Atrasada" | "Cancelada";
export type metodoPeso = "Fixo" | "Orcamento"

export type ObraType = {
    id: string;
    nome: string;
    endereco: string;
    cep: string | null;
    clienteNome: string;
    clientTel: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    status: /*statusObra*/ string,
    progresso_pct: number
    orcamentoTotal:  Decimal | null
    // metodoPeso: metodoPeso
    // estoque Estoque[]
    // etapa   Etapa[]
    // pedidos Pedido[]
}

export interface ObraInputDados { 
    /* Esses dados serão enviados para o servidor vindos do formulario*/
    /** Sera omitido todos os campos gerados automaticamente */
    nome: string;
    endereco: string;
    cep: string | null;
    clientNome: string;
    clientTel: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    orcamentoTotal: number | null;
}

/** Para os campos que podem ser alterados após a criação */
export type EditarObraInputDados = Partial<ObraInputDados>;

export interface NovosDadosInput {
    /** Esse é o estado local do formulario de criação do React */
    /** Todos os dados estão convertidos para strings pois o input html sempre retorna string */
     nome: string;
    endereco: string;
    cep: string;
    clientNome: string;
    clientTel: string;
    dataInicio: string;
    dataFim: string
    orcamentoTotal: string;
}

/** Type especifico para erros de validação por campo */
/** Cada chave corresponde a um campo */
export type ErrosCampoInputObras = Partial<Record<keyof NovosDadosInput, string>>;



export type SubEtapasDB = {
    id: string;
    etapaId: string;
    nome: string;
    ordem: number;
    progressoPct: number;
    pesoManual: number | null; // null -> peso Automatico
};

export type TypeEtapas = {
    id: string;
    obraId: string;
    nome: string;
    ordem: number;
    status: string;
    progressoPct: number;
    pesoFixo: number;
    pesoFixoPadrao: number | Decimal;
    pesoOrcamento: number | Decimal | null;
    custoOrcamento: number | Decimal;
    dataInicio: Date | null;
    dataFim: Date | null;
    subEtapa: SubEtapasDB[];
};

export interface ObraComEtapa extends ObraType {
    etapas: TypeEtapas[]
}

export interface SubEtapaComPeso extends SubEtapasDB {
    pesoEfetivo: number;
};

export interface EtapaComProgresso extends TypeEtapas {
    progressoCalculado: number;
    contribuicaoObra: number;
    pesoAtivo: number | Decimal;
    subEtapas: SubEtapaComPeso[]
}

export type SubEtapaConfig = {
    sub: SubEtapaComPeso;
    totalSubEtapas: number;
    onChange: (uptaded: SubEtapasDB) => void;
    onRemove: () => void;
};

export type EtapaCardProps = {
    etapa: EtapaComProgresso
    onUptade: (uptade: TypeEtapas) => void;
    cor: string;
}

export type EtapaProgressoProps = {
    obraId: string;
    obraNome: string;
    etapasInicias: TypeEtapas[];
    onProgressoChange: ( etapaId: string, subEtapaId: string | null, valor: number ) => Promise<void>;
    onPesoManualChange?: ( subEtapaId: string, peso: number | null ) => Promise<void>;
    onSubEtapaAdd: ( etapaId: string, nome: string ) => Promise<SubEtapasDB>;
    onSubEtapaRemove: ( subEtapaId: string ) => Promise<void>;
}

export type pesoManualForm = {
    subEtapaId: string;
    valor: string;
}

export type TipoLancamento = 
    | "MATERIAL"
    | "MAO_DE_OBRA"
    | "EQUIPAMENTO"
    | "SERVICO"
    | "OUTRO";



// Cada lançamento representa uma saida financeira da obra
export interface Lancamento {
    id: string;
    obraId: string;
    // pedriodoId: string | null;
    etapaId: string | null;
    tipo: TipoLancamento;
    valor: Decimal;
    data: Date;
    descricao: string | null;
    notaFiscal: string | null;
    comprovante: string | null;
}

export interface MetricaGastoMensal {
    // Total de gastos do mês 
    totalMes: number;

    // Total de gasto no mês anterior
    totalMesAnterior: number;

    // Variação de porcentagem em relação ao mês anteior
    variacaoPct: number | null; // positivo = gastou mais | negativo = gastou menos | null = não houve gastos no mes anterior

    // Gastos por obras no mes
    porObra: Map<string, number>; // ObraId - Valor

    // Gastos por tipo de lançamento no mês
    porTipo: Map<TipoLancamento, number>; // Tipo - Valor
}

export interface GastoObraResumo {
    obraId: string;
    obraNome: string;
    gastoMes: number;
    orcamentoTotal: number | null;
    pctOrcamento: number | null; // Porcentagem total dos gastos no mes. Se for null, não houve gastos
    desvioTotal: number | null; // Desvio total ( gasto vs orçamento ). Se for null, não houve orçamentos
}

export interface Periodo {
    de: Date;
    ate: Date;
}

export interface NovoTipoLancamentoInput {
    obraId: string;
    etapaId: string | null;
    tipo: TipoLancamento;
    valor: number,
    date: Date;
    comprovante: string | null;
    notaFiscal: string | null;
    descricao: string | null
};

export interface NovoLancamentoFormState {
    obraId: string;
    etapaId: string;
    tipo: TipoLancamento;
    valor: number;
    date: string;
    comprovante: string | null;
    notaFiscal: string | null;
    descricao: string | null
}

export type NovoLancamentoFormError = Partial<Record<keyof NovoLancamentoFormState, string>>;

export type LancamentoActionResult =
  | { ok: true;  lancamentoId: string }
  | { ok: false; erro: string };

export interface LancamentoResult {
    obraId: string;
    etapaId?: string;
    obraNome?: string;
    tipo: TipoLancamento;
    valor: number;
    data: Date;
    comprovante?: string;
    notaFiscal?: string;
    descricao?: string;
}

export interface ImportResult {
    total: number;
    sucesso: number;
    erros: number;
    detalhes: string[];
}