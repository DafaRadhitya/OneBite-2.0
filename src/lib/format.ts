const idr = new Intl.NumberFormat('id-ID')

/** 15000 → "Rp 15.000" */
export function rupiah(n: number): string {
  return `Rp ${idr.format(n)}`
}

/** 15000 → "15k" (compact, for chips) */
export function rupiahShort(n: number): string {
  return `${Math.round(n / 1000)}k`
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}
