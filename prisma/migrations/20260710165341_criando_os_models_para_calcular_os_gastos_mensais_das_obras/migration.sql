-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "etapaId" TEXT,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "notaFiscal" TEXT,
    "comprovante" TEXT,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lancamento_obraId_data_idx" ON "Lancamento"("obraId", "data");

-- CreateIndex
CREATE INDEX "Lancamento_obraId_tipo_idx" ON "Lancamento"("obraId", "tipo");

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
