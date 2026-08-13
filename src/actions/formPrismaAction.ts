"use server";

import z from "zod";
import { prisma } from "../lib/prisma";
import { schemaObraType } from "@/app/formulario/page";

const schemaSubTarefa = z.object({
    id: z.string().optional(),
    etapaId: z.string().optional(),
    nome: z.string(),
    ordem: z.coerce.number().int(),
    progressoPct: z.coerce.number(),
    pesoManual: z.coerce.number().optional()
});

const schemaEtapa = z.object({
    id: z.string().optional(),
    obraId: z.string().optional(),
    nome: z.string(),
    ordem: z.coerce.number(),
    dataInicio: z.coerce.date().optional(),
    dataFimPrev: z.coerce.date().optional(),
    dataFim: z.coerce.date().optional(),
    progressoPct: z.coerce.number(),
    status: z.string(),
    custoOrcamento: z.coerce.number(),
    pesoFixo: z.coerce.number(),
    pesoFixoPadrao: z.coerce.number(),
    pesoOrcamento: z.coerce.number().optional(),
    custoEtapa: z.coerce.number(),
    subEtapa: z.array(schemaSubTarefa)
});

const schemaObra = z.object({
    id: z.string().optional(),
    nome: z.string(),
    endereco: z.string(),
    cep: z.string().optional(),
    clienteNome: z.string(),
    clientTel: z.string().optional(),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date().optional(),
    status: z.string(),
    progresso_pct: z.coerce.number(),
    orcamentoTotal: z.coerce.number().optional(),
    etapa: z.array(schemaEtapa)
});


export default async function formPrismaAction(formData: schemaObraType) {
    const raw = schemaObra.safeParse(formData);

    if (!raw.success){
        return {error: raw.error.message};
    };

    const { nome, endereco, cep, clienteNome, clientTel, dataInicio, dataFim, status, orcamentoTotal, progresso_pct, etapa } = raw.data;

    try {
        await prisma.obra.create({
            data: {
                nome,
                endereco, 
                cep,
                clienteNome,
                clientTel,
                dataInicio,
                dataFim,
                status,
                orcamentoTotal,
                progresso_pct,
                etapa: {
                    create: etapa.map(e => ({
                        nome: e.nome,
                        ordem: e.ordem,
                        dataInicio: e.dataInicio,
                        dataFimPrev: e.dataFimPrev,
                        dataFim: e.dataFim,
                        progressoPct: e.progressoPct,
                        status: e.status,
                        custoOrcamento: e.custoOrcamento,
                        pesoFixo: e.pesoFixo,
                        pesoFixoPadrao: e.pesoFixoPadrao,
                        custoEtapa: e.custoEtapa,
                        subEtapa: {
                            create: e.subEtapa.map((sub) => ({
                                nome: sub.nome,
                                ordem: sub.ordem,
                                progressoPct: sub.progressoPct,
                                pesoManual: sub.pesoManual
                            }))
                        }
                    }))
                }
            }
        })
    } catch (error){
        console.log(error);
    };
};