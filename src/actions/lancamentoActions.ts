"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
    NovoTipoLancamentoInput,
    NovoLancamentoFormState,
    NovoLancamentoFormError,
    LancamentoActionResult,
    LancamentoResult,
    ImportResult    
} from "@/lib/types"
import { TipoLancamento } from "@/generated/prisma/enums";

export async function validarNovoDados(form: NovoLancamentoFormState): Promise<NovoLancamentoFormError> {
    const erros: NovoLancamentoFormError = {}
    
    if ( !form.obraId ){
        erros.obraId = "selecione uma Obra"
    }

    if ( !form.tipo ){
        erros.tipo = "Seleciona um tipo"
    }

    if ( !form.valor || isNaN(Number(form.valor)) ){
        erros.obraId = "informe um valor valido"
    }

    if ( Number(form.valor) <= 0 ){
        erros.obraId = "o valor deve ser maior que 0"
    }

    if ( !form.date ){
        erros.obraId = "informe uma data de lançamento"
    }

    return erros
}

export async function parseFormLancamentos(form: NovoLancamentoFormState): Promise<NovoTipoLancamentoInput> {
    return {
        obraId: form.obraId,
        etapaId: form.etapaId,
        tipo: form.tipo,
        valor: form.valor,
        date: new Date(form.date),
        descricao: form.descricao,
        notaFiscal: form.notaFiscal,
        comprovante: form.comprovante
    }
};

export async function criarLancamento(input: NovoTipoLancamentoInput): Promise<LancamentoActionResult>{
    try {
        const obra = await prisma.obra.findUnique({
            where: {
                id: input.obraId
            },

            select: { id: true }
        })

        if (!obra) {
            return { ok: false, erro: "Obra não encontrada" }
        };

        const lancamento = await prisma.lancamento.create({
            data: {
                obraId: input.obraId,
                etapaId: input.etapaId,
                tipo: input.tipo,
                valor: input.valor,
                data: input.date,
                descricao: input.descricao,
                comprovante: input.comprovante,
                notaFiscal: input.notaFiscal
            }
        })

        revalidatePath("/");
        revalidatePath(`/obras/${input.obraId}/etapa`);

        return { ok: true, lancamentoId: lancamento.id }
    } catch(error) {
        console.log("Erros ao lançar: ", error)
        return { ok: false, erro: "Erros ao registrar o lançamento, tente novamente..." }
    }
}

export async function inportarLancamento(historico: LancamentoResult[]): Promise<ImportResult> {
    const detalhes: string[] = [];
    let sucesso = 0;
    let erros = 0;

    const tmLote = 50;

    for (let i = 0; i < historico.length; i += tmLote) {
        const lote = historico.slice(i, i + tmLote);

        try {
            const loteResolvido = await resolverObraId(lote);

            const res = await prisma.lancamento.createMany({
                data: loteResolvido,
                skipDuplicates: true
            })

            sucesso += res.count
        } catch(error) {
            console.log(error)
            erros += lote.length
            detalhes.push(
                `Lote ${Math.floor(i / tmLote) + 1} (linha ${i + 1}-${i * lote.length}): ${error instanceof Error ? error.message : "error desconhecido"}`
            )
        }
    }

    revalidatePath("/");

    return { total: historico.length, sucesso, erros, detalhes }
}

export async function resolverObraId(lote: LancamentoResult[]): Promise<Array<{
    obraId: string,
    etapaId: string | undefined,
    tipo: TipoLancamento,
    valor: number,
    data: Date,
    descricao: string | undefined,
    notaFiscal: string | undefined,
    comprovante: null
}>> {
    const nomeResolver = [
        ...new Set(
            lote
                .filter(row => !row.obraId && !row.obraNome)
                .map(row => row.obraNome as string)
        )
    ];

    const obrasEncontradas = nomeResolver.length > 0 ?
        await prisma.obra.findMany({
            where: {
                nome: {
                    in: nomeResolver
                }
            },

            select: {
                id: true,
                nome: true
            }
        })
    : []

    const mapObra = new Map(obrasEncontradas.map(obra => [obra.nome, obra.id]));

    return lote.map(row => {
        const obraId = (row.obraId || mapObra.get(row.obraNome ?? "")) ?? ""

        return {
            obraId,
            etapaId: row.etapaId,
            tipo: row.tipo,
            valor: row.valor,
            data: row.data,
            descricao: row.descricao,
            notaFiscal: row.notaFiscal,
            comprovante: null
        }
    })
}