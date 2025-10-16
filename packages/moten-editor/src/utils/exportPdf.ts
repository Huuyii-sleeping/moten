import html2pdf from 'html2pdf.js'

export interface PdfExportOptions {
  filename?: string
  margin?: number
  image?: { type?: string; quality?: number }
  html2canvas?: { scale: number; useCORS?: true }
  jsPDF?: { unit?: string; format?: string; orientation?: string }
}

export const exportToPdf = (element: string | HTMLElement, options: PdfExportOptions) => {
  const defaultOptions: PdfExportOptions = {
    filename: 'moten-export.pdf',
    margin: 10,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  const opts = { ...defaultOptions, ...options }
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element
  if (!targetElement) {
    console.error('未找到导出元素')
    return
  }

  const worker = html2pdf()
    .from(targetElement as any)
    .set(opts as any)
    .save()
  worker
    .then(() => {
      console.log('PDF导出成功')
    })
    .catch((err: Error) => {
      console.error('PDF导出失败', err)
    })
}
