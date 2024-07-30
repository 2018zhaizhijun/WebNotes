import React, { Component } from 'react';

import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { getPageFromElement } from '../lib/pdfjs-dom';

import '../style/AreaHighlight.css';

import type { IViewportHighlight, LTWHP } from '../types';

interface Props {
  highlight: IViewportHighlight;
  onChange?: (rect: LTWHP) => void;
  isScrolledTo: boolean;
  isEventLayer: boolean;
}

interface EventListenerType {
  onResize?: RndResizeCallback;
  onResizeStop?: RndResizeCallback;
  onDrag?: RndDragCallback;
  onDragStop?: RndDragCallback;
}

export class AreaHighlight extends Component<Props> {
  render() {
    const { highlight, onChange, isScrolledTo, isEventLayer, ...otherProps } =
      this.props;

    let eventListeners: EventListenerType = {};

    if (isEventLayer && onChange) {
      const areaDiv = document.getElementById(`area__${highlight.id}`);
      if (!areaDiv) return;

      eventListeners['onDrag'] = (_, data) => {
        areaDiv.style.transform = `translate(${data.x}px, ${data.y}px)`;
      };

      eventListeners['onDragStop'] = (_, data) => {
        const boundingRect: LTWHP = {
          ...highlight.position.boundingRect,
          top: data.y,
          left: data.x,
        };

        onChange(boundingRect);
      };

      eventListeners['onResize'] = (_1, _2, ref, _3, position) => {
        areaDiv.style.transform = `translate(${position.x}px, ${position.y}px)`;
        areaDiv.style.width = ref.offsetWidth + 'px';
        areaDiv.style.height = ref.offsetHeight + 'px';
      };

      eventListeners['onResizeStop'] = (_1, _2, ref, _3, position) => {
        const boundingRect: LTWHP = {
          top: position.y,
          left: position.x,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          pageNumber: getPageFromElement(ref)?.number || -1,
        };

        onChange(boundingRect);
      };
    }

    return (
      <div
        className={`AreaHighlight ${
          isScrolledTo ? 'AreaHighlight--scrolledTo' : ''
        }`}
      >
        <Rnd
          id={`${isEventLayer ? 'event__area__' : 'area__'}${highlight.id}`}
          className="AreaHighlight__part"
          style={{ background: highlight.backgroundColor || undefined }}
          position={{
            x: highlight.position.boundingRect.left,
            y: highlight.position.boundingRect.top,
          }}
          size={{
            width: highlight.position.boundingRect.width,
            height: highlight.position.boundingRect.height,
          }}
          onClick={(event: Event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          {...eventListeners}
          {...otherProps}
        />
      </div>
    );
  }
}

export default AreaHighlight;
