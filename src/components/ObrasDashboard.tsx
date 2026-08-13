"use client";

import Link from "next/link";

const hoje = new Date()

function barraData(dataEntrega: Date): number {
        hoje.setHours(0, 0, 0, 0);
        
        const entrega = new Date(dataEntrega);
        entrega.setHours(0, 0, 0, 0);

        const diferenca = entrega.getTime() - hoje.getTime();
        return Math.ceil(diferenca / (1000 * 60 * 60 * 24))
    }

    function styleBarra(data: Date): string {
        const dia = barraData(data)

        if (dia < 0) {
            return "bg-[#E24B4A]"
        } else if (dia === 0) {
            return "bg-orange-500"
        } else if (dia <= 7) {
            return "bg-[#BA7517]"
        }

        return "bg-[#639922]"
    }

    function statusAlert(data: Date): string {
        const dia = barraData(data);

        if (dia < 0) {
            return "Atrasada"
        } else if (dia === 0) {
            return "Hoje"
        } else if (dia <= 7) {
            return "Atenção"
        } else {
            return "No Prazo"
        }

    }

    
    function statusAlertColor(data: Date): string {
        const dia = barraData(data);
        
        if (dia < 0) {
            return "#A32D2D"
        } else if (dia === 0) {
            return "orange"
        } else if (dia <= 7) {
            return "#854F0B"
        } 
            return "#3B6D11"
        

    }

interface obrasType {
    id: string;
    nome: string;
    endereco: string;
    cep: string | null;
    clienteNome: string;
    clientTel: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    status: string;
    progresso_pct: number;
    orcamentoTotal: number | null;
}


type obra = {
    obra: obrasType[]
}

export default function ObrasDashboard({obra}: obra) {


    return obra.map(ob => (
            <div 
                key={ob.id} 
                className="flex flex-col w-full sm:w-[47%] border-t-green-500 bg-[#30302E] p-7 rounded-2xl"
                style={{ border: `0.5px solid` }}    
            >
                <Link href={`obras/${ob.id}/etapa`}>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-2xl font-bold">{ob.nome}</p>
                        <span 
                            className="bg-amber-50 rounded-2xl py-0.5 px-2 font-bold"
                            style={{ color: `${statusAlertColor(ob.dataFim ?? new Date(hoje))}` }}
                        >
                            {statusAlert(ob.dataFim ?? new Date(hoje))}
                        </span>
                    </div>

                    <span className="font-bold text-[#9c9a92] mb-1.5">{ob.endereco}</span>

                    <div>
                        <div 
                            className={`h-3 rounded-2xl ${styleBarra(ob.dataFim ?? new Date(hoje))}`} 
                            aria-valuemax={100} 
                            style={{  width: `${ob.progresso_pct}%`, }}
                            // style={{ width: `${ob.progresso_pct}%`, backgroundColor: `${hoje > teste ? "red": "green"}` }}
                        />
                        
                        
                        
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-base text-amber-100 font-medium">{ob.progresso_pct}%</span>
                            <span className="textbase text-amber-100">
                                {ob.dataFim?.toLocaleDateString("pt-br" , {month: "long"}) ?? 2} / {ob.dataFim?.getDay()}
                            </span>
                        </div>
                    </div>
                
                </Link>
            
            </div>
        
    ))
}