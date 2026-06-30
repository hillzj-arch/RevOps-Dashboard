export async function downloadAsPng(element: HTMLElement, filename: string): Promise<void> {
  const { toPng } = await import("html-to-image")
  const dataUrl = await toPng(element, { pixelRatio: 2, cacheBust: true })
  const link = document.createElement("a")
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}
