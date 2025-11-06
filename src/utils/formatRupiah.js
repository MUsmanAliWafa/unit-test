export function formatRupiah(value) {
  if (!value) return 'Rp0'
  return 'Rp' + Number(value).toLocaleString('id-ID')
}

export function parseRupiah(str) {
  if (!str) return 0
  return parseInt(str.replace(/[^0-9]/g, ''), 10)
}
