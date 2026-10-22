// Wait for document images before opening print preview, including a cold logo cache.
export function printWhenReady(): () => void {
  let cancelled = false
  let frame = 0
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('.service-order-print img'))
  void Promise.all(images.map(image => image.decode().catch(() => undefined))).then(() => {
    if (!cancelled) frame = requestAnimationFrame(() => { if (!cancelled) window.print() })
  })
  return () => { cancelled = true; cancelAnimationFrame(frame) }
}
