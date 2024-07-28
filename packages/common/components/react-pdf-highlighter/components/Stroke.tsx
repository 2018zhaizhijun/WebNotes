import { StrokeType } from 'db/prisma';
import React, { Component } from 'react';
import '../style/Highlight.css';
import type { Coords } from '../types.js';

interface Props {
  stroke: StrokeType;
  pathInViewport: Array<Coords>;
  onMouseMove?: (event: React.MouseEvent<SVGPathElement>) => void;
}

export class Stroke extends Component<Props> {
  render() {
    const { stroke, pathInViewport, onMouseMove } = this.props;
    let d = pathInViewport.map((p) => `L${p.x},${p.y}`).join(' ');
    d = 'M' + d.slice(1);

    return (
      <path
        onMouseMove={onMouseMove}
        key={stroke.id}
        stroke={stroke.color || '#ffe28f'}
        strokeWidth={stroke.strokeWidth}
        fill="none"
        d={d}
      />
    );
  }
}

export default Stroke;
