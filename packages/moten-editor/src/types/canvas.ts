export interface DrawLine {
  points: { x: number; y: number; pressure: number }[]
  color: string
  width: number
  isEraser: boolean
  isBackground?: boolean
  imageData?: string
  isArrow?: boolean
  startPos?: { x: number; y: number }
  endPos?: { x: number; y: number }
}
