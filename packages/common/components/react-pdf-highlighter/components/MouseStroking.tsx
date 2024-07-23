import React, { Component } from 'react';

import { asElement, getPageFromElement, isHTMLElement } from '../lib/pdfjs-dom';
import { Page } from '../types';

export interface Coords {
  x: number;
  y: number;
}

interface State {
  // drawing: boolean;
  path: Coords[];
  onMouseDown: (event: MouseEvent) => void;
}

interface Props {
  color: string;
  strokeWidth: number;
  onStrokeStart?: () => void;
  onStrokeEnd?: (page: Page, path: Array<Coords>) => void;
  onChange?: (path: Array<Coords>) => void;
}

class MouseSelection extends Component<Props, State> {
  state: State = {
    // drawing: false,
    path: [],
    onMouseDown: () => {},
  };

  root?: HTMLElement;
  canvas?: HTMLCanvasElement;

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
    const { color, strokeWidth } = nextProps;

    const canvasCollect = Array.from(document.getElementsByTagName('canvas'));
    canvasCollect.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
      }
      return ctx;
    });
  }

  componentDidMount() {
    if (!this.root) {
      return;
    }

    const container = this.root.parentElement;

    if (!container) {
      return;
    }

    const { color, strokeWidth } = this.props;

    const canvasCollect = Array.from(document.getElementsByTagName('canvas'));
    const ctxCollect = canvasCollect.map((canvas) => {
      canvas.style.zIndex = '1';

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      return ctx;
    });

    const onMouseDown = (event: MouseEvent) => {
      const { onStrokeStart } = this.props;

      const startTarget = asElement(event.target);
      if (!isHTMLElement(startTarget)) {
        return;
      }

      const page = getPageFromElement(startTarget);
      if (!page) {
        return;
      }
      const ctx = ctxCollect[page.number - 1];
      if (!ctx) {
        return;
      }

      // onStrokeStart && onStrokeStart();

      const { width, height, clientWidth, clientHeight } = ctx.canvas;
      const scaleToCtx = (x: number, y: number): [number, number] => {
        return [(x * width) / clientWidth, (y * height) / clientHeight];
      };

      this.setState({
        // drawing: true,
        path: [{ x: event.offsetX, y: event.offsetY }],
      });

      ctx.beginPath();
      ctx.moveTo(...scaleToCtx(event.offsetX, event.offsetY));

      const onMouseUp = (event: MouseEvent): void => {
        // emulate listen once
        container.ownerDocument.body.removeEventListener(
          'mousemove',
          onMouseMove
        );
        container.ownerDocument.body.removeEventListener('mouseup', onMouseUp);

        const { path } = this.state;
        const { onStrokeEnd } = this.props;

        // if (!drawing) {
        //   return;
        // }

        onStrokeEnd && path.length > 0 && onStrokeEnd(page, path);
        this.setState({ path: [] });
      };

      const onMouseMove = (event: MouseEvent) => {
        if (
          getPageFromElement(asElement(event.target))?.number !== page.number
        ) {
          onMouseUp(event);
          return;
        }

        const { path } = this.state;

        // if (!drawing) {
        //   return;
        // }

        const coord = path[path.length - 1];
        if (coord.x !== event.offsetX || coord.y !== event.offsetY) {
          this.setState({
            path: path.concat({ x: event.offsetX, y: event.offsetY }),
          });
        }

        ctx.lineTo(...scaleToCtx(event.offsetX, event.offsetY));
        ctx.stroke();
      };

      const { ownerDocument: doc } = container;
      if (doc.body) {
        doc.body.addEventListener('mousemove', onMouseMove);
        doc.body.addEventListener('mouseup', onMouseUp);
      }
    };

    this.setState({ onMouseDown }, () => {
      container.addEventListener('mousedown', this.state.onMouseDown);
    });
  }

  componentWillUnmount() {
    const container = this.root?.parentElement;
    container?.removeEventListener('mousedown', this.state.onMouseDown);

    const canvasCollect = Array.from(document.getElementsByTagName('canvas'));
    canvasCollect.forEach((canvas) => {
      canvas.style.zIndex = '0';
    });
  }

  render() {
    return (
      <div
        className="MouseStroking-container"
        ref={(node) => {
          if (!node) {
            return;
          }
          this.root = node;
        }}
      >
        <canvas
          id="canvas"
          ref={(node) => {
            if (!node) {
              return;
            }
            this.canvas = node;
          }}
        ></canvas>
      </div>
    );
  }
}

export default MouseSelection;
