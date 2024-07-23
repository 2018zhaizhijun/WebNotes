import { green, presetPalettes, red, yellow } from '@ant-design/colors';
import type { ColorPickerProps } from 'antd';

type Presets = Required<ColorPickerProps>['presets'][number];

export const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map<Presets>(([label, colors]) => ({
    label,
    colors,
  }));

export const presets = genPresets({ yellow, red, green });

export const getPopupContainer = (triggerNode: HTMLElement) => {
  return triggerNode.parentNode as HTMLElement;
};

export const throttle = (fn: (...args: any[]) => void, delay = 500) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};
