import { StrokeType } from 'db/prisma';
import React, { useEffect, useMemo } from 'react';
import { EditMode } from '../lib/constants';
import { scaledCoordToSvg } from '../lib/coordinates';
import Stroke from './Stroke';

interface StrokeLayerProps {
  pageNumber: number;
  activated: string;
  viewer: any;
  pageStrokes: Array<StrokeType>;
  deleteStroke?: (id: string) => void;
}

export const StrokeLayer: React.FC<StrokeLayerProps> = ({
  pageNumber,
  viewer,
  pageStrokes,
  deleteStroke,
  activated,
}) => {
  const viewport = useMemo(() => {
    return viewer.getPageView(pageNumber - 1).viewport;
  }, [pageNumber, viewer]);

  useEffect(() => {
    const PdfHighlighter = document.getElementsByClassName('PdfHighlighter')[0];

    if (activated === EditMode.ERASING) {
      PdfHighlighter.classList.add('eraser_cursor');
    } else {
      PdfHighlighter.classList.remove('eraser_cursor');
    }
  }, [activated]);

  return (
    <>
      <canvas
        className="stroke__canvas"
        width={viewport.width}
        height={viewport.height}
      />
      <svg
        width={viewport.width}
        height={viewport.height}
        style={{ position: 'absolute', zIndex: 1 }}
      >
        {pageStrokes.map((stroke) => {
          const path = scaledCoordToSvg(stroke.position.path, viewport);

          return (
            <Stroke
              key={stroke.id}
              stroke={stroke}
              pathInViewport={path}
              onMouseMove={
                activated !== EditMode.ERASING
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      if (event.buttons !== 1) return;

                      deleteStroke && deleteStroke(String(stroke.id));
                      if (event.target instanceof SVGPathElement) {
                        event.target.style.display = 'none';
                      }
                    }
              }
            />
          );
        })}
      </svg>
    </>
  );
};
