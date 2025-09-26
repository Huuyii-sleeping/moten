import type { BaseBlock } from '@/types/edit'


export const baseBlock: BaseBlock[] = [
  {
    id: '',
    code: 'mo-image',
    name: '图片',
    icon: 'image',
    formData: {},
  },
  {
    id: '',
    code: 'mo-video',
    name: '视频',
    icon: 'video',
    formData: {},
  },
  {
    id: '',
    code: 'mo-text',
    name: '文本',
    icon: 'text',
    formData: {},
  },
  {
    id: '',
    name: '幻灯片',
    code: 'mo-swiper',
    icon: 'swiper',
    formData: {},
  },
  {
    id: '',
    name: '留白',
    code: 'mo-blank',
    icon: 'blank',
    formData: {},
  },
]

export const seniorBlocks: BaseBlock[] = [
  {
    id: '',
    name: '多行',
    code: 'mo-row',
    icon: 'row',
    nested: true,
    children: [[], []],
    formData: {},
  },
  {
    id: '',
    name: '多列',
    code: 'mo-column',
    icon: 'column',
    nested: true,
    children: [[], []],
    formData: {},
  },
  {
    id: '',
    name: '画布',
    code: 'mo-canvas',
    icon: 'canvas',
    nested: true,
    children: [[], []],
    formData: {},
  },
]

export const canvasBlocks: BaseBlock[] = [
  {
    id: '',
    name: '图片',
    code: 'mo-image',
    icon: 'image',
    formData: {},
  },
  {
    id: '',
    name: '文本',
    code: 'mo-text',
    icon: 'text',
    formData: {},
  },
]
