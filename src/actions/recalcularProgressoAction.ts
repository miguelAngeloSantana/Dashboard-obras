"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../lib/prisma";

import type { SubEtapasDB, TypeEtapas } from "@/lib/types";
import { calcProgEtapa, calcProgObra } from "../lib/calculos";
import z from "zod";

const schemaSubTarefa = z.object({
    id: z.string().optional(),
    etapaId: z.string().optional(),
    nome: z.string(),
    ordem: z.coerce.number().int(),
    progressoPct: z.coerce.number(),
    pesoManual: z.coerce.number().optional()
})

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

export type typeSchemaEtapa = z.infer<typeof schemaEtapa>;

export async function updateProgresso(etapaId: string, subEtapaId: string | null, valor: number): Promise<void> {
    if (subEtapaId) {
        await prisma.subEtapasDB.update({
            where: { id: subEtapaId },
            data: { progressoPct: valor }
        });
    } else {
        await prisma.etapa.update({
            where: { id: etapaId },
            data: { progressoPct: valor }
        });
    }

    const etapa = await prisma.etapa.findUniqueOrThrow({
        where: { id: etapaId },
        include: { subEtapa: true },
    });

    const progEtapa = calcProgEtapa(etapa);

    await prisma.etapa.update({
        where: { id: etapaId },
        data: { progressoPct: progEtapa }
    });

    const etapasObra = await prisma.etapa.findMany({
        where: { obraId: etapa.obraId },
        include: { subEtapa: true }
    });

    const progObra = calcProgObra(etapasObra);

    await prisma.obra.update({
        where: { id: etapa.obraId },
        data: { progresso_pct: progObra }
    });

    revalidatePath(`/obras/${etapa.obraId}`);
};

export async function getSubEtapas(subEtapaId: string): Promise<SubEtapasDB> {
    return await prisma.subEtapasDB.findUniqueOrThrow({
        where: { id: subEtapaId }
    });
};

export async function getEtapa(etapaId: string): Promise<TypeEtapas> {
    return await prisma.etapa.findUniqueOrThrow({
        where: { id: etapaId },
        include: { subEtapa: true }
    });
};

export async function updatePesoManua(subEtapaId: string, peso: number | null): Promise<void> {
    // console.log(subEtapaId)
    await prisma.subEtapasDB.update({
        where: { id: subEtapaId },
        data: { pesoManual: peso,  }
    });
};

export async function addSubEtapa(etapaId: string, nome: string): Promise<SubEtapasDB> {
    const last = await prisma.subEtapasDB.findFirst({
        where: { etapaId },
        orderBy: { ordem: "desc" },
        select: { ordem: true }
    });

    const novaOrdem = ( last?.ordem ?? 0 ) + 1;

    const novoDado = await prisma.subEtapasDB.create({
        data: {
            etapaId,
            nome,
            ordem: novaOrdem,
            progressoPct: 0,
            pesoManual: null
        },
    });

    return novoDado;
};

export async function removeSubEtapa( subEtapaId: string ): Promise<void> {
    const sub = await prisma.subEtapasDB.findUniqueOrThrow({
        where: { id: subEtapaId },
        select: { etapaId: true },
    });

    await prisma.subEtapasDB.delete({
        where: { id: subEtapaId }
    });

    await updateProgresso(sub.etapaId, null, 0);
};

export async function formEtapa( data:typeSchemaEtapa ) {
    const raw = schemaEtapa.safeParse(data);

    // console.log(raw, raw.data?.subEtapa)

    if (!raw.success){
        return {error: raw.error.message};
    };

    const createEtapa = await prisma.etapa.create({
        data: {
            // obraId: raw.data.obraId as string,
            nome: raw.data.nome,
            ordem: raw.data.ordem,
            status: raw.data.status,
            progressoPct: 0,
            pesoFixo: raw.data.pesoFixo,
            pesoFixoPadrao: Number(raw.data.pesoFixoPadrao),
            pesoOrcamento: Number(raw.data.pesoOrcamento),
            custoOrcamento: Number(raw.data.custoOrcamento),
            custoEtapa: raw.data.custoEtapa,
            dataInicio: raw.data.dataInicio,
            dataFim: raw.data.dataFim,
            dataFimPrev: raw.data.dataFimPrev,
            obra: {
                connect: { id: raw.data.obraId as string}
            },
            subEtapa: {
                create: raw.data.subEtapa.map(e => ({
                    nome: e.nome,
                    ordem: e.ordem,
                    progressoPct: e.progressoPct,
                    pesoManual: e.pesoManual
                }))
            }
        }
    })

    return createEtapa;
};