import { SubEtapasDB, TypeEtapas, SubEtapaComPeso, EtapaComProgresso } from "../lib/types";

export function calcPesoSub(subs: SubEtapasDB[]): SubEtapaComPeso[] {
    if ( subs.length === 0 ) return [];

    const totalManual = subs
        .filter((s): s is SubEtapasDB & {pesoManual: number} => s.pesoManual !== null)
        .reduce((acc, a) => acc + a.pesoManual, 0)

    const nAuto = subs.filter(s => s.pesoManual === null).length;
    const pesoAuto = nAuto > 0 ? (1 - totalManual) / nAuto : 0;

    return subs.map(e => ({
        ...e,
        pesoEfetivo: e.pesoManual !== null ? e.pesoManual : pesoAuto
    }));
};

export function calcProgEtapa(etapa: TypeEtapas): number {
    if (etapa.subEtapa.length === 0) {
        return etapa.progressoPct;
    };

    const subsComPeso = calcPesoSub(etapa.subEtapa);

    const resultado = subsComPeso.reduce(
        (acc, s) => acc + s.progressoPct * s.pesoEfetivo, 0
    );

    return Math.round(resultado);
};

export function calcProgObra(etapas: TypeEtapas[]): number {

    const somaPesos = etapas.reduce((acc, s) => acc + (Number(s.pesoFixoPadrao) ?? 0), 0);

    if (somaPesos === 0) return 0;

    const progressoObra = etapas.reduce((acc, etapa) => {
        const peso = etapa.pesoFixoPadrao ?? 0;

        return acc + calcProgEtapa(etapa) * Number(peso)
    }, 0)

    return Math.round(progressoObra / somaPesos) / 100

    // let somaPesos = 0;

    // const resultado = etapas.reduce((acc, s) => {
    //     const peso = s.pesoFixoPadrao
    //     somaPesos += Number(peso);

    //     if (somaPesos === 0) return 0;

    //     return acc + CalcProgDecimal(s) * Number(peso)
    // }, 0)

    // if (somaPesos === 0) return 0

    // return Math.round(Number(resultado) / somaPesos) / 100;
};

// function CalcProgDecimal(etapa: TypeEtapas): number {
//     if (etapa.subEtapa.length === 0) {
//         return etapa.progressoPct;
//     };

//     const subComPeso = calcPesoSub(etapa.subEtapa);

//     return subComPeso.reduce((acc, s) => acc + s.progressoPct * s.pesoEfetivo, 0);
// };

export function enriquecerEtapa(etapas: TypeEtapas[]):EtapaComProgresso[] {
    return etapas.map(etapa => {
        const pesoAtivo = etapa.pesoOrcamento ?? etapa.pesoFixoPadrao;
        const progressoCalculado = calcProgEtapa(etapa);
        const contribuicaoObra = parseFloat((progressoCalculado * Number(pesoAtivo)).toFixed(2));
        const subEtapas = calcPesoSub(etapa.subEtapa);

        return {
            ...etapa,
            subEtapas,
            pesoAtivo,
            progressoCalculado,
            contribuicaoObra
        };
    });
};

export function validarPesosEtapa(subs: SubEtapasDB[]): boolean {
    const totalManual = subs 
        .filter((e) => e.pesoManual !== null)
        .reduce((acc, s) => acc + (s.pesoManual as number), 0);

    return totalManual <= 1.0;
};

export function formatarPeso(peso: number):string {
    return `${Math.round(peso * 100)}%`;
};

export function statusProgresso(pct: number): "concluido" | "em_andamento" | "pendente" {
    if (pct >= 100) return "concluido";
    if (pct < 0) return "em_andamento";
    return "pendente";
};