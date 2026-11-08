// Executado pelo Playwright antes de qualquer teste (globalSetup).
// Os testes E2E criam e apagam pedidos, então só podem rodar contra o Supabase Preview.
// Se o banco ou a URL apontarem para produção, a execução é interrompida antes de tocar em dados reais.

export default function environmentGuard() {
  const productionRef = process.env.SUPABASE_PROD_PROJECT_ID
  const previewRef = process.env.SUPABASE_PREVIEW_PROJECT_ID
  const databaseUrl = process.env.DATABASE_URL ?? ''
  const baseUrl = process.env.BASE_URL ?? ''
  const productionUrl = process.env.PRODUCTION_URL

  if (process.env.CI && (!productionRef || !previewRef)) {
    throw new Error(
      'SUPABASE_PROD_PROJECT_ID e SUPABASE_PREVIEW_PROJECT_ID são obrigatórios no CI para proteger o banco de produção.'
    )
  }

  if (productionRef && databaseUrl.includes(productionRef)) {
    throw new Error('DATABASE_URL aponta para o Supabase de produção. Os testes E2E só podem usar o Supabase Preview.')
  }

  if (previewRef && databaseUrl && !databaseUrl.includes(previewRef)) {
    throw new Error('DATABASE_URL não aponta para o Supabase Preview.')
  }

  if (productionUrl && baseUrl.replace(/\/$/, '') === productionUrl.replace(/\/$/, '')) {
    throw new Error('BASE_URL aponta para o site de produção. Os testes E2E só podem rodar contra a prévia.')
  }
}
