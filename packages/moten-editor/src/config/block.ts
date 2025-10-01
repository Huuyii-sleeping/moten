import type { BaseBlock, ElementBlock } from '@/types/edit'

export const baseBlock: BaseBlock[] = [
  {
    id: '',
    code: 'image',
    name: '图片',
    icon: 'image',
    formData: {},
  },
  {
    id: '',
    code: 'video',
    name: '视频',
    icon: 'video',
    formData: {},
  },
  {
    id: '',
    code: 'textarea',
    name: '文本',
    icon: 'text',
    formData: {},
  },
  {
    id: '',
    name: '幻灯片',
    code: 'slide',
    icon: 'swiper',
    formData: {},
  },
  {
    id: '',
    name: '留白',
    code: 'blank',
    icon: 'blank',
    formData: {},
  },
]

export const seniorBlocks: BaseBlock[] = [
  {
    id: '',
    name: '多行',
    code: 'row',
    icon: 'row',
    nested: true,
    children: [[], []],
    formData: {},
  },
  {
    id: '',
    name: '多列',
    code: 'column',
    icon: 'column',
    nested: true,
    children: [[], []],
    formData: {},
  },
  {
    id: '',
    name: '画布',
    code: 'canvas',
    icon: 'canvas',
    nested: true,
    children: [[]],
    formData: {},
  },
]

export const setFormData = (defaultValue: any) => {
  return {
    desktop: defaultValue,
    monile: defaultValue,
  }
}

export const canvasBlocks: ElementBlock[] = [
  {
    id: '',
    code: 'image',
    name: '图片',
    icon: 'image',
    formData: {},
  },
  {
    id: '',
    code: 'ElButton',
    name: '按钮',
    icon: 'button',
    formData: {
      type: setFormData('primary'),
      content: setFormData('button'),
      size: setFormData(''),
    },
    type: 'el',
  },
]
