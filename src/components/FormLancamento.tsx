"use client";

import { useState, useTransition, useEffect } from "react";

import { ObraType, NovoLancamentoFormState, NovoLancamentoFormError, TipoLancamento } from "@/lib/types";

import { validarNovoDados, parseFormLancamentos, criarLancamento } from "@/actions/lancamentoActions";

type obraTypeFormat = Omit<ObraType, "orcamentoTotal">&{orcamentoTotal: number}

interface NovoLancamentoForm {
    obra: obraTypeFormat[]
    obraIdOp?: string;
    etapas?: Array<{id: string, nome: string}>;
    onSucess?: () => void
}

const tipos: { value: TipoLancamento; label: string }[] = [
    { value: "MATERIAL", label: "Material" },
    { value: "MAO_DE_OBRA", label: "Mao de Obra" },
    { value: "EQUIPAMENTO", label: "Equipamento" },
    { value: "SERVICO", label: "Serviço" },
    { value: "OUTRO", label: "Outro" }, 
]

const estadoInicial = (obraIdOp?: string): NovoLancamentoFormState => ({
    obraId: obraIdOp ?? "",
    etapaId: "",
    tipo: "MATERIAL",
    valor: 0,
    date: new Date().toISOString().split("")[0],
    descricao: "",
    notaFiscal: "",
    comprovante: ""
})

function Campo({
    label, erro, obrigatorio = false, children,
}: {
    label: string, erro?: string, obrigatorio?: boolean, children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">
                {label}
                { obrigatorio && <span className="text-[#E24B4A] ml-2">*</span> }
            </label>

            {children}
            { erro && <span className="text-[#A32D2D] text-sm">{erro}</span> }

        </div>
    )
};

const inputStyle = (temErro?: boolean): React.CSSProperties => ({
    fontSize: 12,
    padding: "12px 18px",
    border: `0.5px solid ${temErro ? "#E24B4A": "red"}`,
    borderRadius: 8,
    width: "100%"
});

export default function FormLancamento({
    obra, obraIdOp, etapas = [], onSucess
}: NovoLancamentoForm) {

    obra.map(e => ({
        ...e,
        orcamenstoTotal: Number(e.orcamentoTotal)
    }))

    const [ form, setForm ] = useState<NovoLancamentoFormState>(estadoInicial(obraIdOp));
    const [ erro, setErro ] = useState<NovoLancamentoFormError>({});
    const [ visible, setVisible ] = useState(true);
    const [ erroGlobal, setErroGlobal ] = useState<string | null>(null);
    const [ isPedding, startTransition ] = useTransition();

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 3000);

        return () => clearTimeout(timer)
    }, [])

    const [ sucesso, setSucesso ] = useState(false);

    const set = (campo: keyof NovoLancamentoFormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm(prev => ({...prev, [campo]: e.target.value}));
        if (erro[campo]) setErro(prev => ({...prev, [campo]: undefined}))
    }

    const handlerSubmit = async(e: React.SubmitEvent) => {
        e.preventDefault();
        setErroGlobal(null);
        setSucesso(false);

        const errosValidacoes = validarNovoDados(form);
        if (Object.keys(errosValidacoes).length > 0) {
            setErro(await errosValidacoes);
            return;
        }

        const input = parseFormLancamentos(form);

        startTransition(async() => {
            const resultado = await criarLancamento(await input);

            if (resultado.ok) {
                setSucesso(true);
                setForm(estadoInicial(obraIdOp));
                onSucess?.()
            } else {
                setErroGlobal(resultado.erro);
            };
        });
    };

    return (
        <form onSubmit={handlerSubmit} noValidate className="flex justify-center w-full">
            <div className="flex flex-col gap-14 w-full px-8">
                <div className="text-base text-center font-medium">
                    Registrar lançamento
                </div>

                { sucesso && (
                    visible && (
                        <div className="bg-[#EAF3DE] rounded-[8] px-2 py-3 text-sm text-[#27500A]">
                            Lançamento Registrado - O Dashboard será atualizado automaticamente
                        </div>
                    )
                ) }

                { erroGlobal && (
                    <div className="bg-[#FCEBEB] rounded-[8] px-2 py-3 text-sm text-[#A32D2D]">
                        {erroGlobal}
                    </div>
                ) }

                { obraIdOp ? (
                    // Obra já definida pelo contexto da página
                    <div className="text-sm py-2 px-2.5 rounded-[8] text-center">
                        Obra: <span className="font-bold text-lg">{ obra.find(e => e.id === obraIdOp)?.nome ?? obraIdOp }</span>
                    </div>
                ): (
                    <Campo label="Obra" obrigatorio erro={erro.obraId}>
                        <select 
                            value={form.obraId} 
                            onChange={set("obraId")}
                            style={inputStyle(!!erro.obraId)}
                        >
                            <option value="">Seleciona a obra...</option>
                            {obra.map(o => (
                                <option key={o.id} value={o.id}>{o.nome} - {o.clienteNome}</option>
                            ))}
                        </select>
                    </Campo>
                ) }

                {/* Tipo e valor na mesma linha */}
                <div className="grid grid-cols-2 gap-12">
                    <Campo label="Tipo" obrigatorio erro={erro.tipo}>
                        <select 
                            value={form.tipo} 
                            onChange={set("tipo")}
                            style={inputStyle(!!erro.tipo)}
                            className="cursor-pointer"
                        >
                            {tipos.map(t => (
                                <option key={t.value} value={t.value} className="bg-black cursor-pointer">{t.label}</option>
                            ))}
                        </select>
                    </Campo>

                    <Campo label="valor" obrigatorio erro={erro.valor}>
                        <input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.valor}
                            onChange={set("valor")}
                            placeholder="Ex: 5000.00"
                            style={inputStyle(!!erro.valor)}
                        />
                    </Campo>
                </div>

                {/* Data e Etapa */}
                <div className="grid grid-cols-2 gap-12">
                    <Campo label="Data de Lançamento" obrigatorio erro={erro.date}>
                        <input 
                            type="date"
                            value={form.date}
                            onChange={set("date")}
                            style={inputStyle(!!erro.date)}
                        />
                    </Campo>

                    { etapas.length > 0 && (
                        <Campo label="Etapa (Opcional)">
                            <select
                                value={form.etapaId}
                                onChange={set("etapaId")}
                                style={inputStyle(false)}
                            >
                                <option value="">Sem etapas especificas</option>
                                { etapas.map(e => (
                                    <option key={e.id} value={e.id} className="bg-black">{e.nome}</option>
                                )) }
                            </select>
                        </Campo>
                    ) }
                </div>

                {/* Descrição */}
                <Campo label="Descricao" erro={form.descricao || ""}>
                    <input 
                        type="text"
                        value={form.notaFiscal || "Ex: NF-e 001234"}
                        onChange={set("notaFiscal")}
                        placeholder="Ex: NF-e 001234"
                        style={inputStyle(!!erro.notaFiscal)}
                    />
                </Campo>
                
                {/* Butão */}
                <button
                    type="submit"
                    disabled={isPedding}
                    className="text-sm font-medium py-2 rounded-[8] border-none "
                >
                    { isPedding ? "Salvando" : "Registrar lançamento" }
                </button>
            </div>
        </form>
    )
}