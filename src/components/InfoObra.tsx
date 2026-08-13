import { prisma } from "@/lib/prisma";
import { calcMetricaGastoMensal, fimMes, fimMesAnteior, incioMesAnteior, inicioMes } from "@/lib/gastos";
import ObrasDashboard from "./ObrasDashboard";

export default async function InfoObra() {
    const obra = await prisma.obra.findMany({
        orderBy: { id: "asc" }
    })

    
    const hoje = new Date();
    const dataLimiteEntrega = new Date().setDate(hoje.getDate() + 7)
    
    const h = await prisma.obra.findMany({
       where: {
        dataFim: {
            gte: hoje, // Maior ou igual a hoje
            lte: new Date(dataLimiteEntrega) // Menou ou igaul a daqui a 7 dias
        }
       }
        
    })

    const lancamento = await prisma.lancamento.findMany({
        where: {
            data: {
                gte: inicioMes(hoje),
                lte: fimMes(hoje)
            }
        }
    })

    const anteriorLancamento = await prisma.lancamento.findMany({
        where: {
            data: {
                gte: incioMesAnteior(hoje),
                lte: fimMesAnteior(hoje)
            }
        }
    });


    const metricasAnteriore = calcMetricaGastoMensal(anteriorLancamento, incioMesAnteior(hoje));
    
    const metricas = calcMetricaGastoMensal(lancamento, hoje);

    const varia = ((metricas.totalMes - metricasAnteriore.totalMes) / metricasAnteriore.totalMes) * 100


    const dadosFormatados = obra.map(e => ({
        ...e,
        orcamentoTotal: Number(e.orcamentoTotal)
    }))
    

    return (
        <div className="flex justify-between flex-col items-center w-[94%]">
            <div className="flex flex-col sm:flex-row gap-7 justify-center sm:justify-between items-center w-full">
                <div className="flex flex-col items-center bg-[#262624] w-full sm:w-3xs py-4 rounded-2xl">
                    <span className="text-gray-300 text-base">Obras Ativas</span>
                    <span className="text-bold text-3xl">{obra.length}</span>
                </div>

                <div className="flex flex-col items-center bg-[#262624] w-full sm:w-3xs py-4 rounded-2xl">
                    <span className="text-gray-300 text-base">Gastos Esse mês</span>
                    <span className="text-bold text-2xl">${metricas.totalMes / 100}K</span>
                    <span className="text-bold text-base mt-1.5 text-gray-400">+{varia.toFixed(0)}% vs {incioMesAnteior(hoje).toLocaleDateString("pt-br", {month: "long"})}</span>
                </div>

                <div className="flex flex-col items-center bg-[#262624] w-full sm:w-3xs py-4 rounded-2xl">
                    <span className="text-gray-300 text-base">Pedidos Abertos</span>
                    <span className="text-bold text-3xl">0</span>
                </div>

                <div className="flex flex-col items-center bg-[#262624] w-full sm:w-3xs py-4 rounded-2xl">
                    <span className="text-gray-300 text-base">Alerta</span>
                    <span className="text-red-500 text-center text-4xl font-bold">{h.length}</span>
                    <span className="text-bold text-base text-gray-400">estoque + prazo</span>
                </div>

            </div>

            <div className="mt-16 flex justify-center sm:justify-between w-full flex-wrap gap-16 ">
                <ObrasDashboard obra={dadosFormatados}/>
            </div>
        </div>
    )
}