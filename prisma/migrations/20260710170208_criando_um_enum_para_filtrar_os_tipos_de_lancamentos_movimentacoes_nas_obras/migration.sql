/*
  Warnings:

  - Changed the type of `tipo` on the `Lancamento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('MATERIAL', 'MAO_DE_OBRA', 'EQUIPAMENTO', 'SERVICO', 'OUTRO');

-- AlterTable
ALTER TABLE "Lancamento" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoLancamento" NOT NULL;

-- CreateIndex
CREATE INDEX "Lancamento_obraId_tipo_idx" ON "Lancamento"("obraId", "tipo");
