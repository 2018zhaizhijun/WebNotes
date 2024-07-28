import React, { useCallback, useEffect } from 'react';

import { DownOutlined, EditOutlined } from '@ant-design/icons';
import './ToolBar.css';

import { ColorPicker, Slider, Tooltip } from 'antd';
import { Color } from 'antd/es/color-picker/color';
import { EditMode } from '../lib/constants';
import { getPopupContainer, presets } from '../lib/utils';

interface ToolBarProps {
  color: string;
  strokeWidth: number;
  activated: string;
  onColorChange: (color: Color) => void;
  onStrokeWidthChange: (value: number) => void;
  setActivated: (mode: string) => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  color,
  strokeWidth,
  activated,
  onColorChange,
  onStrokeWidthChange,
  setActivated,
}) => {
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
      <div
        className={`flex h-full flex-dr ${
          activated === EditMode.ERASING ? 'active' : ''
        }`}
      >
        <div
          className="PdfHighlighter__toolbar__item"
          onClick={() =>
            setActivated(activated === EditMode.ERASING ? '' : EditMode.ERASING)
          }
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="2600"
            width="20"
            height="20"
          >
            <path
              d="M667.257905 139.873524l3.85219 3.632762 252.903619 254.537143a73.142857 73.142857 0 0 1 0 103.107047L604.501333 822.686476H828.952381v73.142857H266.532571l-172.129523-173.226666a73.142857 73.142857 0 0 1 0-103.131429L567.344762 143.530667a73.142857 73.142857 0 0 1 99.913143-3.632762zM227.181714 589.604571L146.285714 671.036952l150.674286 151.649524h163.303619l-233.081905-233.081905zM619.227429 195.047619L278.747429 537.721905l253.70819 253.70819 339.675429-341.820952L619.227429 195.047619z"
              p-id="2601"
            ></path>
          </svg>
          擦除
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
