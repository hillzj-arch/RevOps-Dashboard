export async function downloadAsPng(element: HTMLElement, filename: string): Promise<void> {
  const { toPng } = await import("html-to-image")

  // html-to-image iterates document.styleSheets to inline CSS; cross-origin sheets
  // (CopilotKit, etc.) throw SecurityError on .cssRules access. Patch to suppress.
  const descriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, "cssRules")
  Object.defineProperty(CSSStyleSheet.prototype, "cssRules", {
    get() {
      try { return descriptor?.get?.call(this) ?? [] } catch { return [] }
    },
    configurable: true,
  })

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true"),
    })
    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
  } finally {
    Object.defineProperty(CSSStyleSheet.prototype, "cssRules", descriptor!)
  }
}
