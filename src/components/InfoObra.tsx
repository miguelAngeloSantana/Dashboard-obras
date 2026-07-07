import { prisma } from "@/lib/prisma";

export default async function InfoObra() {

    const obra = await prisma.obra.findMany({
        orderBy: { id: "asc" }
    })
    // console.log(obra.length)

    return (
        <div className="flex justify-between items-center w-[94%]">
            <div className="flex flex-col items-center bg-[#262624] w-3xs py-4 rounded-2xl">
                <span className="text-gray-400 text-base">Obras Ativas</span>
                <span className="text-bold text-3xl">{obra.length}</span>
            </div>

            <div className="flex flex-col items-center bg-[#262624] w-3xs py-4 rounded-2xl">
                <span className="text-gray-400 text-base">Gastos Esse mês</span>
                <span className="text-bold text-2xl">$124k</span>
            </div>

            <div className="flex flex-col items-center bg-[#262624] w-3xs py-4 rounded-2xl">
                <span className="text-gray-400 text-base">Pedidos Abertps</span>
                <span className="text-bold text-3xl">0</span>
            </div>

            <div className="flex flex-col items-center bg-[#262624] w-3xs py-4 rounded-2xl">
                <span className="text-gray-400 text-base">Alerta</span>
                <span className="text-red-600">2</span>
                <span className="text-bold text-2xl">estoque + prazo</span>
            </div>
        </div>
    )
}