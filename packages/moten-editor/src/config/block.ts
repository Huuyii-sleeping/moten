import icon from './icon'

const { row, column, image, video, text, swiper, blank, canvas } = icon

export interface baseBlock {
    id: string
    code: string
    name: string,
    icon: string,
    nested?: boolean
    children?: any[][]
    formData: any 
}