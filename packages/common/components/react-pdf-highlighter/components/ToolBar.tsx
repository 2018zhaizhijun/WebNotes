import React, { useCallback, useEffect } from 'react';

import { DownOutlined, EditOutlined } from '@ant-design/icons';
import './ToolBar.css';

import { ColorPicker, Slider, Tooltip } from 'antd';
import { Color } from 'antd/es/color-picker/color';
import { getPopupContainer, presets } from '../lib/utils';

export const EditMode = {
  STROKING: 'stroking',
};

interface ToolBarProps {
  color: string;
  strokeWidth: number;
  activated: string;
  onColorChange: (color: Color) => void;
  onStrokeWidthChange: (value: number) => void;
  setActivated: (mode: string) => void;
}

export function ToolBar({
  color,
  strokeWidth,
  activated,
  onColorChange,
  onStrokeWidthChange,
  setActivated,
}: ToolBarProps) {
  const draw = useCallback((color: string, strokeWidth: number) => {
    const canvas: HTMLCanvasElement = document.getElementById(
      'tool_bar_canvas'
    ) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const width = canvas.width,
      height = canvas.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.bezierCurveTo(20, 30, 40, 30, 50, 20);
    ctx.bezierCurveTo(60, 10, 80, 10, 90, 25);
    ctx.stroke();
  }, []);

  useEffect(() => {
    draw(color, strokeWidth);
  }, [draw, color, strokeWidth]);

  return (
    <div className="PdfHighlighter__toolbar">
      <div
        className={`flex h-full flex-dr ${
          activated === EditMode.STROKING ? 'active' : ''
        }`}
      >
        <div
          className="PdfHighlighter__toolbar__item"
          onClick={() =>
            setActivated(
              activated === EditMode.STROKING ? '' : EditMode.STROKING
            )
          }
        >
          <EditOutlined />
          绘制
        </div>
        <div className="PdfHighlighter__toolbar__item">
          <Tooltip
            className="h-full"
            overlayInnerStyle={{ backgroundColor: '#ffffff', color: 'black' }}
            placement="bottomRight"
            arrow={false}
            trigger="click"
            afterOpenChange={() => draw(color, strokeWidth)}
            title={
              <div>
                <div className="flex align-c">
                  <ColorPicker
                    value={color}
                    presets={presets}
                    size="small"
                    onChangeComplete={onColorChange}
                    getPopupContainer={getPopupContainer}
                    format="rgb"
                  />
                  <canvas id="tool_bar_canvas" width="100" height="40"></canvas>
                </div>
                <Slider
                  style={{ width: '110px' }}
                  value={strokeWidth}
                  min={1}
                  max={12}
                  onChange={onStrokeWidthChange}
                />
              </div>
            }
          >
            <DownOutlined />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default ToolBar;
