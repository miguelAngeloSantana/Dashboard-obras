"use client"
import { z } from "zod";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import formPrismaAction from "../../actions/formPrismaAction";

const schemaSubTarefa = z.object({
    id: z.string().optional(),
    etapaId: z.string().optional(),
    nome: z.string(),
    ordem: z.coerce.number(),
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

interface schemaObraInterface {
    indexItem: number
}

export type schemaObraType = z.infer<typeof schemaObra>

export default function Formulario(){

    const route = useRouter();
    
    const date = new Date();

    const { register, control, handleSubmit } = useForm<schemaObraType>({
        resolver: zodResolver(schemaObra),
        defaultValues: {
            nome: "",
            endereco: "",
            cep: "",
            clienteNome: "",
            clientTel: "",
            dataInicio: new Date(`${date.toLocaleDateString('pt-br', {month: 'long'})} ${date.getFullYear()}`),
            dataFim: new Date(),
            status: "",
            progresso_pct: 0,
            orcamentoTotal: 0,
            etapa: [
                {
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
            ]
        }
    });

    async function handleSubmitForm(data: schemaObraType){
       formPrismaAction(data)

       route.back()
    }

    function SubItems({indexItem}: schemaObraInterface){
        const { fields } = useFieldArray({
            control,
            name: `etapa.${indexItem}.subEtapa`,
    
        })

        return (
            <div className="mt-10">
                <h3 className="text-center text-2xl ">Sub etapas 2</h3>
                {
                        fields.map((field, index) => (
                            
                            <div key={field.id} className="mt-6">
                                <div className="flex flex-col text-center justify-center mb-5 w-full">
                                    <label className="text-md mb-4">Nome da sub etapa</label>
                                    <input
                                        type="text"
                                        required
                                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                        {...register(`etapa.${index}.subEtapa.${index}.nome`)}
                                    />
                                </div>
    
                                <div className="flex flex-col text-center justify-center mb-5 w-full">
                                    <label className="text-md mb-4">Ordem da sub etapa</label>
                                    <input 
                                        type="number"
                                        required
                                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                        {...register(`etapa.${index}.subEtapa.${index}.ordem`, {valueAsNumber: true})}
                                    />
                                </div>
    
                                <div className="flex flex-col text-center justify-center mb-5 w-full">
                                    <label className="text-md mb-4">Progresso da sub etapa</label>
                                    <input 
                                        type="number"
                                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                        {...register(`etapa.${index}.subEtapa.${index}.progressoPct`, {valueAsNumber: true})}
                                    />
                                </div>
    
                                 <div className="flex flex-col text-center justify-center mb-5 w-full">
                                    <label className="text-md mb-4">Peso manual da sub etapa</label>
                                    <input 
                                        type="number"
                                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                        {...register(`etapa.${index}.subEtapa.${index}.pesoManual`, {valueAsNumber: true})}
                                    />
                                </div>
                            </div>
                        ))
                    }
            </div>
        )

    }

     const { fields } = useFieldArray({
            control,
            name: "etapa",
    
        })


    return(
        <div>
            <form 
                onSubmit={handleSubmit(handleSubmitForm, (error) => console.log(error))} /*action={action}*/
                className="flex flex-col justify-center items-center mt-5"    
            >
                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Nome da obra</label>
                    <input 
                        type="text" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("nome")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Endereço da Obra</label>
                    <input 
                        type="text" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("endereco")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Cep</label>
                    <input 
                        type="text" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("cep")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Nome do Cliente</label>
                    <input 
                        type="text" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("clienteNome")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Telefone do Client ( Opcional )</label>
                    <input 
                        type="text"
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("clientTel")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Inicio da Obra</label>
                    <input 
                        type="date" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("dataInicio")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Data do fim da obra</label>
                    <input 
                        type="date"
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("dataFim")} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Staus da obra</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Em andamento, concluida ou pendente"
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("status")} 
                    /> 
                </div>

                 <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Progresso da obra</label>
                    <input 
                        type="number" 
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("progresso_pct", {valueAsNumber: true})} 
                    />
                </div>

                <div className="flex flex-col text-center justify-center mb-5 w-full">
                    <label className="text-md mb-4">Orçamento da obra</label>
                    <input 
                        type="number" 
                        step="0.01"
                        required
                        className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                        {...register("orcamentoTotal", {valueAsNumber: true})} 
                    />
                </div>

                <h3 className="font-bold text-2xl mb-10 mt-12">Etapas</h3>
                {
                    fields.map((field, index) => (
                        <div key={field.id} className="w-full">
                            <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Nome da etapa</label>
                                <input 
                                    type="text"
                                    required
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto" 
                                    {...register(`etapa.${index}.nome`)}
                                />
                            </div>

                            <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Ordem da etapa</label>
                                <input 
                                    type="number"
                                    required
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto" 
                                    {...register(`etapa.${index}.ordem`, {valueAsNumber: true})}
                                />
                            </div>

                            <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Data de inicio da etapa</label>
                                <input 
                                    type="date"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.dataInicio`)}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Data de termino previsto da etapa</label>
                                <input 
                                    type="date"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.dataFimPrev`)}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Data de fim da etapa</label>
                                <input 
                                    type="date"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.dataFim`)}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Progresso da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.progressoPct`, {valueAsNumber: true})}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Status da etapa</label>
                                <input 
                                    type="text"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.status`)}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Custo de orçamento da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.custoOrcamento`, {valueAsNumber: true})}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Peso fixo (ou não) da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.pesoFixo`, {valueAsNumber: true})}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Peso padrão da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.pesoFixoPadrao`, {valueAsNumber: true})}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Valor de peso do orçamento da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.pesoOrcamento`, {valueAsNumber: true})}
                                />
                            </div>

                             <div className="flex flex-col text-center justify-center mb-5 w-full">
                                <label className="text-md mb-4">Custo de etapa da etapa</label>
                                <input 
                                    type="number"
                                    className="border border-zinc-800 shadow-sm h-10 bg-zinc-900 rounded focus:outline p-3 w-[40%] mx-auto"
                                    {...register(`etapa.${index}.custoEtapa`, {valueAsNumber: true})}
                                />
                            </div>

                             <SubItems indexItem={index}/>
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