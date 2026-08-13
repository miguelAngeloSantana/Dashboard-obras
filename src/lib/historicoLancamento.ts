import { prisma } from "../lib/prisma";
import type { LancamentoResult } from "./types";

export async function historicoLancamento(): Promise<void> {
    console.log("Buscando dados existentes...");

    const obras  = await prisma.obra.findMany({
        select: {
            id: true,
            nome: true
        }
    })

    if (obras.length === 0) {
        console.log("Nenhuma obra encontrada");
        return;
    };

    const mapa = new Map(obras.map(o => [o.nome, o.id]));

    const lancamentoHistorico: LancamentoResult[] = [
      {
        obraId: '8f05fa8d-630d-416a-bb89-93c0ed7c6bf5',
        obraNome: 'Terraço',
        tipo: 'SERVICO',
        valor: 24000,
        data: new Date('2026-07-18')
      },
      {
        obraId: 'c3ba7d1e-5a3e-42bb-b2b6-dd3737325178',
        obraNome: 'Reforma quarto',
        tipo: 'SERVICO',
        valor: 14000,
        data: new Date('2026-07-01')
      }
    ]

    const dadosId = lancamentoHistorico.map(row => {
        const obraId = row.obraId || mapa.get(row.obraNome ?? "");
        if (!obraId) {
            console.warn(`Obra não encontrada: Os dados da obra ${row.obraNome} serão ignodados`);
            return null;
        };

        return {
            obraId,
            etapaId: row.etapaId ?? null,
            tipo: row.tipo,
            valor: row.valor,
            data: row.data,
            descricao: row.descricao ?? null,
            notaFiscal: row.notaFiscal ?? null,
            comprovante: row.comprovante ?? null
        }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

    console.log(`Inseridno ${dadosId.length} no historico`);


    const res = await prisma.lancamento.createMany({
        data: dadosId,
        skipDuplicates: true
    })

    console.log(`${res.count} lançamentos criados com sucesso`);

    console.log("Resumo por obra");
    
    const porObra = new Map<string, number>();

    dadosId.forEach(l => {
        porObra.set(l.obraId, (porObra.get(l.obraId) ?? 0) + l.valor);
    })

    for (const[obracomId, total] of porObra.entries()){
        const nome = obras.find(obra => obra.id === obracomId)?.nome ?? obracomId;
        console.log(`${nome}: R$ ${total.toLocaleString("pt-BR")}`)
    }

    const tot = dadosId.reduce((s, l) => s + l.valor, 0);
    console.log(`Total: ${tot.toLocaleString("pt-BR")}`)
}

historicoLancamento()
.catch(console.error)
.finally(() => prisma.$disconnect())