"use client";

import { useForm, useFieldArray } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z }from "zod";

import { formEtapa } from "@/actions/recalcularProgressoAction";

import { useRouter } from "next/navigation";

const schemaSubTarefa = z.object({
    id: z.string().optional(),
    etapaId: z.string().optional(),
    nome: z.string(),
    ordem: z.coerce.number(),
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

export type schemaEtapaType = z.infer<typeof schemaEtapa>;

// interface dataFormType {
//     obraId: string, 
//         nome: string, 
//         ordem: number,
//         status: string, 
//         pesoFixo: number,
//         pesoFixoPadrao: number,
//         pesoOrcamento: number,
//         custoOrcamento: number, 
//         dataInicio: Date,
//         dataFim: Date,
//         subEtapa: [{
//             id: string;
//             etapaId: string;
//             nome: string;
//             ordem: number;
//             progressoPct: number;
//             pesoManual: number  
//         }]
// }

interface PropsObra {
    params: Promise<{ obraId: string }>
};


export default function FormEtapa({params}: PropsObra) {

    const route = useRouter();

    const { register, control, handleSubmit } = useForm<schemaEtapaType>({
    resolver: zodResolver(schemaEtapa),
    defaultValues: {
        nome: "",
        ordem: 0,
        dataInicio: new Date(),
        dataFimPrev: new Date(),
        dataFim: new Date(),
        progressoPct: 0,
        status: "",
        custoOrcamento: 0,
        pesoFixo: 0,
        pesoFixoPadrao: 0,
        pesoOrcamento: 0,
        custoEtapa: 0,
        subEtapa: [
            {
                nome: "",
                ordem: 0,
                progressoPct: 0,
                pesoManual: 0
            }
        ]
    }
})
    
    async function handleSubmitForm(data: schemaEtapaType) {
        const { obraId } = await params;
        String(obraId)

        await formEtapa({
            ...data,
            obraId: obraId,
            custoOrcamento: Number(data.custoOrcamento),
            pesoFixoPadrao: Number(data.pesoFixoPadrao),
            pesoOrcamento: Number(data.pesoOrcamento)
        })

        route.back();
    }

    const { fields } = useFieldArray({
        control,
        name: "subEtapa"
    })
    return (
        <div className="w-full">
            <h1 className="text-center text-2xl font-bold mt-3">Adicionar outra etapa</h1>
            <form 
                onSubmit={handleSubmit(handleSubmitForm, (error) => console.log(error))}
                className="flex flex-col justify-center items-center mt-5"     
            >
                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Nome da Etapa</label>
                    <input 
                        type="text" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("nome")}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Ordem da Etapa</label>
                    <input 
                        type="number" 
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("ordem")}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Status da Etapa</label>
                    <input 
                        type="text" 
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("status")}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Peso da Etapa</label>
                    <input 
                        type="number" 
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("pesoFixo")}
                    />
                </div>

                 <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Peso da Etapa para o progresso da obra</label>
                    <input 
                        type="number" 
                        required
                        placeholder="Por Exemplo 0.25 -> 25%"
                        step="0.01"
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("pesoFixoPadrao", {valueAsNumber: true})}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Progresso da Obra</label>
                    <input 
                        type="number" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("progressoPct")}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Peso do Orçamento da Etapa</label>
                    <input 
                        type="number" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%]] mx-auto"
                        {...register("pesoOrcamento", {valueAsNumber: true})}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Custo da Etapa</label>
                    <input 
                        type="number" 
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("custoEtapa")}
                    />
                </div>

                   <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Orçamento disponivel para o obra</label>
                    <input 
                        type="number" 
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("custoOrcamento", {valueAsNumber: true})}
                    />
                </div>

                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Data de Inicio</label>
                    <input 
                        type="date" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("dataInicio")}
                    />
                </div> 
              
                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Data de de previstão para terminar ( Opcional )</label>
                    <input 
                        type="date"
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("dataFimPrev")}
                    />
                </div>  

                
                <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                    <label className="text-md mb-1">Data de Termino da obra</label>
                    <input 
                        type="date" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                            p-3 w-full sm:w-[40%] mx-auto"
                        {...register("dataFim")}
                    />
                </div> 

                <h2 className="font-bold text-2xl mb-10 mt-12">Sub Etapas</h2>

                {
                    fields.map((field, index) => (
                        <div key={field.id} className="w-full">
                            <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                                <label className="text-md mb-1">Nome da Sub Etapa</label>
                                <input 
                                    type="text"
                                    required
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                                        p-3 w-full sm:w-[40%] mx-auto"
                                    {...register(`subEtapa.${index}.nome`)}
                                />
                            </div>

                            <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                                <label className="text-md mb-1">Ordem da Sub Etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                                        p-3 w-full sm:w-[40%] mx-auto"
                                    {...register(`subEtapa.${index}.ordem`)}
                                />
                            </div>

                            <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                                <label className="text-md mb-1">Progresso da Sub Etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                                        p-3 w-full sm:w-[40%] mx-auto"
                                    {...register(`subEtapa.${index}.progressoPct`)}
                                />
                            </div>

                            <div className="flex flex-col justify-center items-center mt-5 w-full mb-9 px-2 sm:px-0">
                                <label className="text-md mb-1">Peso da Sub Etapa</label>
                                <input 
                                    type="number"
                                    required
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline 
                                        p-3 w-full sm:w-[40%] mx-auto"
                                    {...register(`subEtapa.${index}.pesoManual`)}
                                />
                            </div>
                        </div>
                    ))
                }

                <input
                    className="border py-2 px-8 rounded-[14px] font-bold text-lg cursor-pointer hover:bg-gray-950 mb-4" 
                    type="submit" 
                    value="enviar" 
                />
            </form>
        </div>
    )
}