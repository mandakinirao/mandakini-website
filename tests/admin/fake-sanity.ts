/** In-memory stand-in for the parts of SanityClient the admin lib uses. */
export interface PatchOp {
  id: string
  set?: Record<string, unknown>
  inc?: Record<string, number>
  dec?: Record<string, number>
}

export function makeFakeClient(docs: Record<string, Record<string, unknown>>) {
  const patches: PatchOp[] = []
  const transactions: PatchOp[][] = []

  const patchBuilder = (id: string, sink: PatchOp[]) => {
    const op: PatchOp = { id }
    const b = {
      set(obj: Record<string, unknown>) { op.set = { ...op.set, ...obj }; return b },
      inc(obj: Record<string, number>) { op.inc = { ...op.inc, ...obj }; return b },
      dec(obj: Record<string, number>) { op.dec = { ...op.dec, ...obj }; return b },
      async commit() { sink.push(op); return { _id: id } },
      _op: op,
    }
    return b
  }

  const client = {
    async fetch(_query: string, params?: Record<string, unknown>) {
      if (params?.id) return docs[params.id as string] ?? null
      if (params?.ids) return (params.ids as string[]).map((i) => docs[i]).filter(Boolean)
      return null
    },
    patch(id: string) {
      return patchBuilder(id, patches)
    },
    transaction() {
      const ops: PatchOp[] = []
      const tx = {
        patch(id: string, fn: (p: ReturnType<typeof patchBuilder>) => unknown) {
          const b = patchBuilder(id, [])
          fn(b)
          ops.push(b._op)
          return tx
        },
        async commit() { transactions.push(ops); return {} },
      }
      return tx
    },
  }

  return { client, patches, transactions }
}
