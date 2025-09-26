import type { PropType } from "vue";

/**
 * 标注图片的信息
 */
export type MolinkPropsTarget = '_blank' | '_self' | '_parent' | '_top'

export const props = {
  to: {
    type: String,
    default: ''
  },
  target: {
    type: String as PropType<MolinkPropsTarget>,
    default: '_blank',
  }
};
 