export function asPgVector(v: number[]) {
  // pgvector espera formato textual: [0.12,0.34,...]
  return `[${v.join(',')}]`
}
