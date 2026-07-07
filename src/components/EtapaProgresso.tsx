"use client";

import { useState, useCallback, useMemo, useTransition } from "react";

import { TypeEtapas, EtapaProgressoProps } from "../lib/types";
import { enriquecerEtapa, calcProgObra } from "../lib/calculos";

import EtapaCard from "./EtapaCard";
import Link from "next/link";

const cor_etapa: Record<number, string> = {
    0: "#5DCAA5",
    1: "#378ADD",
    2: "#EF9F27",
    3: "#D85A30",
    4: "#7F77DD",
    5: "#D4537E"
};

const corPorIndice = (i: number) => cor_etapa[i % Object.keys(cor_etapa).length];

// function BarraSegmentoObra({ etapa }: { etapa: ReturnType<typeof enriquecerEtapa> }) {
//     return (
//         <div 
//             role="progressbar"
//             aria-valuenow={calcProgObra(etapa)}
//             aria-valuemin={0}
//             aria-valuemax={100}
//             aria-label="Progresso total da obra"
//             className="h-[30] overflow-hidden flex"
//         >
//             { etapa.map((e, i) => (
//                 <div 
//                     key={e.id} 
//                     title={`${e.nome}: ${e.progressoCalculado}% x ${formatarPeso(Number(e.pesoAtivo))} = 
//                         ${e.contribuicaoObra.toFixed(1)}`
//                     }
//                     className="h-10 "
//                     style={{ width: `${Number(e.pesoAtivo) * 100}%`, backgroundColor: corPorIndice(i), 
//                         opacity: e.progressoCalculado / 100 
//                     }}
//                 />
//             ))}
//         </div>
//     );
// };

// function FormumaDebugBox({ etapa }: { etapa: ReturnType<typeof enriquecerEtapa> }) {
//     const progObra = calcProgObra(etapa)

//     return (
//         <div className="mt-12 py-3 px-3.5 text-sm leading-[1.9]">
//             <div className="font-medium mb-4 text-sm">
//                 Logica de calculos ativa
//             </div>

//             { etapa.map(e => {
//                 const temSubs = e.subEtapas.length > 0;
//                 const subLabel = temSubs
//                     ?  `média(${e.subEtapas.map(s => s.progressoPct).join(", ")}) = ${e.progressoPct / 100}%`
//                     : `slider = ${e.progressoCalculado}%`;

//                 return (
//                     <div key={e.id}>
//                         { e.nome  }: { subLabel }
//                         { "->" }
//                         {/* <span className="text-[#3B6D11]"> { e.contribuicaoObra.toFixed(1) } ss</span> */}
//                         <span className="text-[#3B6D11]"> { e.progressoCalculado }% </span>
//                         {/* <span className="text-[#3B6D11]"> { Math.round((e.progressoPct * e.pesoFixo) / 100) } </span> */}

//                     </div>
//                 )
//             })}

//             <div className="mt-6 pt-6 font-medium">
//                 Obra total = { progObra }%
//             </div>
//         </div>
//     );
// };

export function EtapaProgresso({ 
    obraNome, 
    etapasInicias, 
    onProgressoChange, 
    onPesoManualChange, 
    onSubEtapaAdd,
    onSubEtapaRemove,
    obraId
}: EtapaProgressoProps) {
    const [ etapa, setEtapa ] = useState<TypeEtapas[]>(etapasInicias);
    const [ isPending, startTransition ] = useTransition();

    const etapasRicas = useMemo(() => enriquecerEtapa(etapa), [etapa]);
    const progObra = useMemo(() => calcProgObra(etapa), [etapa]);

    const handlerUptadeEtapa = useCallback((uptade: TypeEtapas) => {
        const anterior = etapa.find(e => e.id === uptade.id);
        if (!anterior) return;

        setEtapa(prev => prev.map(e => e.id === uptade.id ? uptade: e));

        startTransition(async() => {
            try {
                if ( 
                    anterior.progressoPct !== uptade.progressoPct && 
                    uptade.subEtapa.length === 0 && 
                    onProgressoChange
                ) {
                    await onProgressoChange(uptade.id, null, uptade.progressoPct);
                } 

                if ( onProgressoChange ) {
                    for (const sub of uptade.subEtapa ) {
                        const subAnterior = anterior.subEtapa.find(s => s.id === sub.id);
                        if (subAnterior && subAnterior.progressoPct !== sub.progressoPct) {
                            await onProgressoChange(uptade.id, sub.id, sub.progressoPct)
                        }
                    }
                }

                if (onPesoManualChange) {
                    for (const sub of uptade.subEtapa) {
                        const subAnterior = anterior.subEtapa.find(e => e.id === sub.id);
                        if (subAnterior && subAnterior.pesoManual !== sub.pesoManual) {
                            await onPesoManualChange(sub.id, sub.pesoManual);
                        }
                    }
                }

                if (onSubEtapaAdd) {
                    const novaSub = uptade.subEtapa.find(
                        s => !anterior.subEtapa.some(a => a.id === s.id)
                    )

                    if (novaSub) {
                        const saveSub = await onSubEtapaAdd(uptade.id, novaSub.nome)

                        // Substituir o id local pelo id do banco

                        setEtapa(prev => prev.map(e => 
                            e.id === uptade.id ? {...e, subEtapas: e.subEtapa.map(s => s.id === novaSub.id ? saveSub: s)}: e
                        ));
                    }
                }

                if (onSubEtapaRemove) {
                    const removida = anterior.subEtapa.find(
                        e => !uptade.subEtapa.some(s => s.id === e.id)
                    )

                    if (removida && !removida.id.startsWith("local_")) {
                        await onSubEtapaRemove(removida.id)
                    };
                };

            } catch(error) {
                console.log("Error ao prersistir alterações: ",  error);
                setEtapa(prev => prev.map(e => e.id === anterior.id ? anterior: e));
            }
        })
    }, [etapa, onProgressoChange, onPesoManualChange, onSubEtapaAdd, onSubEtapaRemove])

    return (
        <div className="max-w-[680] my-0 mx-auto pt-4 pb-0 px-6">

            {/* Cabeçalho da obra */}
            <div className="rounded-[12] py-3.5 px-4 mb-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="text-lg font-medium mb-3">
                            {obraNome}
                        </div>

                        <div 
                            className="text-3xl font-bold leading-none" 
                            style={{ color:  progObra === 100 ? "#3B6D11": "#fff"}}
                        >
                            {progObra}%
                        </div>

                        <div className="text-sm mt-4">
                            Progresso Geral da Obra
                            {  isPending && (
                                <span className="ml-8 text-[#185FA5]">Salvando...</span>
                            )}
                        </div>
                    </div>

                    {/* <FormEtapa /> */}
                    <button className="border py-2 px-8 rounded-[14px] font-bold text-lg cursor-pointer hover:bg-gray-950">
                        <Link href={`/formularioetapa/${obraId}`}>Adicionar nova etapa</Link>
                    </button>
                </div>

                {/* Barras segmentadas */}
                {/* <BarraSegmentoObra etapa={etapasRicas} /> */}

                {/* Legenda de cores */}
                {/* <div className="flex flex-wrap gap-x-3 gap-y-1 my-8">
                    { etapasRicas.map((e, i) => (
                        <div key={e.id} className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-[50%]" style={{ backgroundColor: corPorIndice(i)}} />
                            <span className="text-sm">{e.nome}ssssssss</span>
                        </div>
                    ))}
                </div> */}
            </div>

            {/* Label da sessão */}
            <div className="text-sm text-center sm:text-left font-medium uppercase tracking-[.05rem] mb-10">
                Etapas - Clique para expandir . Adicionar Sub Etapas
            </div>

            {/* Cards de Etapas */}
            { etapasRicas.map((etapa, i) => (
                <EtapaCard 
                    key={etapa.id}
                    etapa={etapa}
                    cor={corPorIndice(i)}
                    onUptade={handlerUptadeEtapa}
                />
            ))}

            {/* Debug de formula */}
            {/* <FormumaDebugBox etapa={etapasRicas}/> */}
        </div>
    )
}