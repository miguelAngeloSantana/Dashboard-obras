"use client"

import type { MetricaGastoMensal, GastoObraResumo } from "@/lib/types";

interface GastoMesCard {
    metricas: MetricaGastoMensal,
    gastoPorObra: GastoObraResumo[],
    mesReferencia: string
}

function formatar(valor: number): string {
    if (valor >= 1_000_000) return `R$${(valor / 1_000_000).toFixed(2)}M`
    if (valor >= 1_000) return `R$${(valor / 1_000).toFixed(0)}K`

    return `R$${valor.toFixed(0)}`
};

function formatarVariacao(pct: number | null): {
    texto: string,
    cor: string,
    sinal: string
} {
    if( pct === null ) return { texto: "primeiro mes", cor: "red", sinal: "" }

    const abs = Math.abs(pct);
    const sinal = pct >= 0 ? "+" : "-";
    const cor = pct > 0 ? "#A32D2D" : "#27500A";

    return {
        texto: `${abs.toFixed(0)}% do mes anterior`, sinal, cor
    }
}

function ObraGasto({ resumo }: { resumo: GastoObraResumo }) {
    const pct = resumo.pctOrcamento ?? 0;
    const pctAcima = pct > 100;
    const barColor = pctAcima ? "#E24B4A" : pct > 80 ? "#BA7517" : "#639922";
    const barWidth = Math.min(pct, 100);

    return (
        <div className="mb-8">
            <div className="flex justify-between mb-3">
                <span className="text-sm font-medium">
                    {resumo.obraNome}
                </span>

                <div className="flex gap-8 items-center">
                    <span className="text-sm">
                        {resumo.gastoMes} do mes
                    </span>

                    {resumo.desvioTotal !== null && (
                        <span 
                            className="text-sm font-medium px-1.5 py-1 rounded-[20]"
                            style={{ backgroundColor: pctAcima ? "#FCEBEB": "#EAF3DE", color: pctAcima ? "#A32D2D" : "#27500A" }}    
                        >
                            { pctAcima ? "+" : "-" }{ resumo.desvioTotal.toFixed(0) }%
                        </span>
                    )}
                </div>
            </div>

            {/* Barra de procentagem do orçamento consumido */}
            <div className="h-4 rounded-[2]">
                <div className="h-4 rounded-[2]" style={{ backgroundColor: barColor, width: barWidth }} />

            </div>

            { resumo.orcamentoTotal && (
                <div className="text-sm mt-2">
                    { pct.toFixed(0) }% do orçamento total ({ formatar(resumo.orcamentoTotal) })
                </div>
            ) }
        </div>
    )
}

export function GastoEsteMes({ metricas, gastoPorObra, mesReferencia }: GastoMesCard) {
    const variacao = formatarVariacao(metricas.variacaoPct);

    const obrasOrdenadas = [...gastoPorObra].sort((a, b) => b.gastoMes - a.gastoMes);

    const tipoMaisGasto = [...metricas.porTipo.entries()].sort((a, b) => b[1] - a[1])[0];

    const labelDesc: Record<string, string> = {
        MATERIAL: "Material",
        MAO_DE_OBRA: "Mao de Obra",
        EQUIPAMENTO: "Equipamento",
        SERVICO: "Servico",
        OUTRO: "Outros"
    }

    return (
        <div className="rounded-[12] p-16">
            {/* Cabeçalho Valor Principal */}
            <div className="mb-14">
                <div className="text-sm mb-4">
                    Gastos este mês: {mesReferencia}
                </div>

                <div className="flex items-end gap-10">
                    <div className="text-3xl font-medium">
                        {formatar(metricas.totalMes)}
                    </div>

                    <div className="text-sm mb-2" style={{ color: variacao.cor }}>
                        {variacao.sinal} {variacao.texto}
                    </div>
                </div>

                {/* Linha mês anterior */}
                {metricas.totalMesAnterior > 0 && (
                    <div className="text-sm mt-4">
                        Mês Anterior: {formatar(metricas.totalMesAnterior)}
                    </div>
                )}
            </div>

            {/* BreakDown Por Tipo */}
            {tipoMaisGasto && (
                <div className="flex gap-6 flex-wrap mb-14 pb-14">
                    {[...metricas.porTipo.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .map(([tipo, valor]) => (
                            <div className="flex items-center gap-4 px-1 py-2" key={tipo}>
                                <span>{labelDesc[tipo] ?? tipo}</span>
                                <span className="font-medium">{formatar(valor)}</span>
                            </div>
                        ))
                    }
                    
                </div>
            )}

            {/* BreakDown Por Obra */}
            <div>
                <div className="text-sm font-medium uppercase mb-10">
                    Por Obra - Orçamento Acumulado
                </div>

                { obrasOrdenadas.length === 0 ? (
                    <div className="text-sm">
                        Nenhum lançamento este mês
                    </div>
                ): (
                    obrasOrdenadas.map(obra => <ObraGasto key={obra.obraId} resumo={obra}/>)
                ) }
            </div>
        </div>
    )
}