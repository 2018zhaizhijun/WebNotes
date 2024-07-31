import React, { Component } from 'react';

import '../style/Highlight.css';
import { IViewportHighlight } from '../types';

interface Props {
  highlight: IViewportHighlight;
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  deleteHighlight?: (id: string) => void;
  backgroundColor?: string;
  isScrolledTo: boolean;
  isEventLayer: boolean;
}

export class Highlight extends Component<Props> {
  render() {
    const {
      highlight,
      onClick,
      onMouseOver,
      onMouseOut,
      backgroundColor = '#ffe28f',
      isScrolledTo,
      isEventLayer,
    } = this.props;

    const { rects } = highlight.position;

    return (
      <div
        id={`${isEventLayer ? 'event__highlight__' : 'highlight__'}${
          highlight.id
        }`}
        className={`Highlight ${isScrolledTo ? 'Highlight--scrolledTo' : ''}`}
      >
        <div className="Highlight__parts">
          {rects.map((rect, index) => (
            <div
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
              onClick={onClick}
              key={index}
              style={{ ...rect, background: backgroundColor }}
              className={`Highlight__part`}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Highlight;
