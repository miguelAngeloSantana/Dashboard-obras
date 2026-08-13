import { prisma } from "@/lib/prisma";

import { EtapaProgresso } from "@/components/EtapaProgresso";

import { updateProgresso, updatePesoManua, addSubEtapa, removeSubEtapa } from "@/actions/recalcularProgressoAction";
import FormLancamento from "@/components/FormLancamento";

interface PropsObra {
    params: Promise<{ obraId: string }>
};

async function getEtapa(obraId: string) {
    return prisma.etapa.findMany({
        where: { obraId },
        include: { subEtapa: { orderBy: { ordem: "asc" } } },
        orderBy: { ordem: "asc" }
    });
};

async function getObra(obraId: string) {
    return prisma.obra.findUniqueOrThrow({
        where: { id: obraId },
        include: { etapa: true }
    });
};

export default async function EtapaPage({params}: PropsObra) {

    const { obraId } = await params;

    const obras = await prisma.obra.findMany();

    const [ obra, etapa ] = await Promise.all([
        getObra(obraId),
        getEtapa(obraId)
    ]);

    const etapasFormatadas = etapa.map(e => ({
        ...e,
        custoOrcamento: Number(e.custoOrcamento),
        pesoFixoPadrao: Number(e.pesoFixoPadrao),
        pesoOrcamento: Number(e.pesoOrcamento)
    }))

    const obrasFormatadas = obras.map(e => ({
        ...e,
        orcamentoTotal: Number(e.orcamentoTotal)
    }))

    return (
        <>
            <div className="max-w-[720] my-0 mx-auto py-6 px-4">
                <EtapaProgresso 
                    obraId={obra.id}
                    obraNome={obra.nome}
                    etapasInicias={etapasFormatadas}
                    onProgressoChange={updateProgresso}
                    onPesoManualChange={updatePesoManua || null}
                    onSubEtapaAdd={addSubEtapa}
                    onSubEtapaRemove={removeSubEtapa}
                />             
            </div>

            <FormLancamento 
                obra={obrasFormatadas}
                etapas={etapasFormatadas}
                obraIdOp={obraId}
            />
        </>
    )
}