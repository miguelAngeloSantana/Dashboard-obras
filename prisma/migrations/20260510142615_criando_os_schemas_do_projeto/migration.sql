-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT,
    "clienteNome" TEXT NOT NULL,
    "clientTel" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planejando',
    "progresso_pct" INTEGER NOT NULL,
    "orcamentoTotal" DECIMAL(12,2),

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "nomeMaterial" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "categoria" TEXT,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "qtdPlanejada" DECIMAL(10,3) NOT NULL,
    "qtdDisponivel" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "qtdMinima" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "obraId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etapa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataFimPrev" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "progressoPct" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "custoOrcamento" DECIMAL(12,2) NOT NULL,
    "pesoFixo" INTEGER NOT NULL,
    "pesoFixoPadrao" DECIMAL(5,4) NOT NULL,
    "pesoOrcamento" DECIMAL(5,4),
    "custoEtapa" INTEGER DEFAULT 0,
    "obraId" TEXT NOT NULL,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "pedidoId" TEXT,
    "tipo" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "origem" TEXT NOT NULL,
    "qtdAntes" DECIMAL(10,3) NOT NULL,
    "atdDepois" DECIMAL(10,3) NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevEntrega" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Avaliando',
    "valorTotal" DECIMAL(12,2),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "precoUnit" DECIMAL(10,2),

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubEtapasDB" (
    "id" TEXT NOT NULL,
    "etapaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "progressoPct" INTEGER NOT NULL DEFAULT 0,
    "pesoManual" INTEGER DEFAULT 0,

    CONSTRAINT "SubEtapasDB_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Obra_status_idx" ON "Obra"("status");

-- CreateIndex
CREATE INDEX "Obra_dataFim_idx" ON "Obra"("dataFim");

-- CreateIndex
CREATE INDEX "Estoque_obraId_idx" ON "Estoque"("obraId");

-- CreateIndex
CREATE INDEX "Estoque_qtdDisponivel_idx" ON "Estoque"("qtdDisponivel");

-- CreateIndex
CREATE UNIQUE INDEX "Estoque_obraId_materialId_key" ON "Estoque"("obraId", "materialId");

-- CreateIndex
CREATE INDEX "Etapa_obraId_idx" ON "Etapa"("obraId");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_obraId_key" ON "Etapa"("obraId");

-- CreateIndex
CREATE INDEX "Movimentacao_estoqueId_idx" ON "Movimentacao"("estoqueId");

-- CreateIndex
CREATE INDEX "Movimentacao_pedidoId_idx" ON "Movimentacao"("pedidoId");

-- CreateIndex
CREATE INDEX "Pedido_obraId_status_idx" ON "Pedido"("obraId", "status");

-- CreateIndex
CREATE INDEX "Pedido_fornecedorId_idx" ON "Pedido"("fornecedorId");

-- CreateIndex
CREATE INDEX "Pedido_dataPrevEntrega_idx" ON "Pedido"("dataPrevEntrega");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPedido_pedidoId_materialId_key" ON "ItemPedido"("pedidoId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE INDEX "Fornecedor_ativo_idx" ON "Fornecedor"("ativo");

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubEtapasDB" ADD CONSTRAINT "SubEtapasDB_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
