"use client";

import { useState, useId } from "react";

import { EtapaCardProps, SubEtapasDB } from "../lib/types";
import { statusProgresso } from "../lib/calculos";

import SubEtapaRow from "./SubEtapaRow";

function StatusBedge({ pct }: { pct:number }) {
    const status = statusProgresso(pct);

    const configStatus = {
        concluido: { label: "concluido", color: "#27500A", bg: "#EAF3DE" },
        em_andamento: { label: "em_andamento", color: "#0C447C", bg: "#E6F1FB" },
        pendente: { label: "pendente", color: "red", bg: "#FFF" }
    };

    const { label,  bg, color} = configStatus[status];

    return (
        <span className="text-base font-bold py-0.5 px-2" style={{ backgroundClip: bg, color }}>
            {label}
        </span>
    );
};

export default function EtapaCard({ etapa, cor, onUptade }: EtapaCardProps){
    const [ expandita, setExpandita ] = useState(etapa.subEtapas.length > 0);
    const [ novoNome, setNovoNome ] = useState("");

    const inputId = useId();

    const temSubEtapas = etapa.subEtapas.length > 0;

    const hanlderAddSub = () => {
        const nome = novoNome.trim();
        if (!nome) return;

        const novoDado: SubEtapasDB = {
            id: `local_${Date.now()}`,
            etapaId: etapa.id,
            nome,
            ordem: etapa.subEtapas.length + 1,
            progressoPct: 0,
            pesoManual: null
        }

        onUptade({ ...etapa,  subEtapa: [...etapa.subEtapas, novoDado ]});
        setNovoNome("");
        setExpandita(true);

        setTimeout(() => {
            window.location.reload()
        }, 1000);
    };

    const hanlderUptadeSub = (subId: string, uptaded: SubEtapasDB) => {
        onUptade({ ...etapa, subEtapa: etapa.subEtapas.map(e => e.id === subId ? uptaded : e) });
    };

    const hanlderRemoveSub = (subId: string) => {
        onUptade({ ...etapa, subEtapa: etapa.subEtapas.filter(e => e.id !== subId) });
    };


    const hanlderProgressoManual = async ( e: React.ChangeEvent<HTMLInputElement> ) => {
        onUptade({ ...etapa, progressoPct: Number(e.target.value)});
    };

    const hanlderInputKeyDow = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
        if (e.key === "Enter") hanlderAddSub();
    };

    const { progressoCalculado } = etapa;

    const barColor = (progressoCalculado / 100) === 100 ? "#639922" :
        progressoCalculado > 0 ? "#BA7517" :
        "red";

    return (
        <div className="mb-24 overflow-visible ">

            {/* Hanlder clicavel */}
            <button 
                type="button"
                onClick={() => setExpandita(v => !v)}
                aria-expanded={expandita}
                aria-controls={`etapa-body-${etapa.id}`}
                className="w-full flex items-center flex-col sm:flex-row gap-10 py-3 px-3.5 bg-none cursor-pointer text-left"
            >
                {/* Indicador de cor */}
                <div className="w-10 h-10 rounded-[50%] shrink-0" style={{ backgroundColor: cor }} />

                {/* Nome e Bedge */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-lg font-medium">{etapa.nome}</span>
                            <span className="text-sm">
                                Peso da Etapa: <span className="font-bold text-base">{Number(etapa.pesoFixoPadrao)*100}</span>
                            </span>
                        </div>

                        { temSubEtapas && (
                            <span className="text-sm py-px px-2 bg-[#E6F1FB] text-[#185FA5]">
                                { etapa.subEtapas.length } Sub-Etapas
                            </span>
                        ) }
                        <StatusBedge pct={progressoCalculado} />
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-7 h-4">
                        <div style={{ width: `${progressoCalculado / 100}%`, backgroundColor: barColor}} className="h-4" aria-valuemax={100}/>
                    </div>
                </div>

                {/* % de contribuição */}
                <div className="text-right shrink-0 flex gap-4 items-center justify-center">
                    <div 
                        className="text-base font-medium" 
                        style={{ color: progressoCalculado === 100 ? "#3B6D11": progressoCalculado > 0 ? "#BA7517": "#fff" }}
                    >
                        {progressoCalculado / 100}%
                    </div>
                    

                    {/* Chevrown */}
                    <div 
                        className="text-sm text-mauve-200 shrink-0" 
                        style={{ transform: expandita ? "rotate(180deg)": "rotate(0deg)", transition: "transform .2s" }}
                    >
                        ▼
                    </div>
                </div>
            </button>

            {/* Corpo expandito */}
            { expandita &&(
                <div id={`etapa-body-${etapa.id}`} className="pt-0 pb-3.5 px-3.5 w-[75vw] sm:w-full">
                    <div className="pt-3 pr-4 mt-16 mx-auto">

                        {/* Slider direto (sem sub-etapas) */}

                        { !temSubEtapas && (
                            <div className="flex items-center gap-10 mb-12 py-2.5 px-3">
                                <label htmlFor={`prog-${etapa.id}`} className="text-sm flex-1">
                                    Progresso Direto
                                </label>
                                <input 
                                    id={`prog-${etapa.id}`}
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={etapa.progressoPct}
                                    onChange={hanlderProgressoManual}
                                    className="accent-[#3B6D11] cursor-pointer"
                                    style={{ width: 140 }}
                                />

                                <span className="text-sm font-medium w-[30] text-right">
                                    {etapa.progressoPct}%
                                </span>
                            </div>
                        ) }

                        {/* Lista de Sub Etapas */}

                        { temSubEtapas && (
                            <>
                                { etapa.subEtapas.map(sub => (
                                    <SubEtapaRow 
                                        key={sub.id}
                                        sub={sub}
                                        totalSubEtapas={etapa.subEtapas.length}
                                        onChange={uptaded => hanlderUptadeSub(sub.id, uptaded)}
                                        onRemove={() => hanlderRemoveSub(sub.id)}
                                    />
                                    
                                )) }
                            </>
                        ) }

                        {/* Campo adicionar sub etapas */}
                        
                        <div className="flex gap-8">
                            <label htmlFor={inputId} className="hidden">Nome da nova sub etapa</label>
                            <input 
                                id={inputId}
                                type="text"
                                value={novoNome}
                                onChange={e => setNovoNome(e.target.value)}
                                onKeyDown={hanlderInputKeyDow}
                                placeholder={temSubEtapas ? "Nova sub etapa..." : "Divir tarefa em sub etapas..."}  
                                className="flex-1 py-1.5 px-2.5 "
                            />

                            <button 
                                type="button"
                                onClick={hanlderAddSub}
                                disabled={!novoNome.trim()}
                                className="text-sm font-medium py-1.5 px-3.5"
                                style={{ 
                                    border: "0.5px solid #639922", 
                                    backgroundColor:  novoNome.trim() ? "#EAF3DE" : "#f2f2f2",
                                    color: novoNome.trim() ? "#27500A" : "red",
                                    cursor: novoNome.trim() ? "pointer" : "default"
                                }}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
};