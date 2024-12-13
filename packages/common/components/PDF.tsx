'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from './react-pdf-highlighter';

import Sidebar from './Sidebar';
import Spinner from './react-pdf-highlighter/components/Spinner';
import Tip from './react-pdf-highlighter/components/Tip';

import { DeleteOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import './PDF.css';

import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { HighlightType, StrokeType } from '../db/prisma';
import { withErrorBoundaryCustom } from '../utils/error';
import { API_HOST, queryParse, sendRequest } from '../utils/http';
import Chatbot from './chatbot';

type PdfHighlighterProps = React.ComponentProps<typeof PdfHighlighter>;

const parseIdFromHash = () =>
  document.location.hash.slice('#highlight-'.length);

const resetHash = () => {
  document.location.hash = '';
};

const HighlightPopup = ({
  comment,
  deleteHighlight,
  hideTip,
  readOnly = false,
}: {
  comment?: { text: string } | null;
  deleteHighlight?: () => void;
  hideTip?: () => void;
  readOnly?: boolean;
}) => {
  return (
    <div className="Highlight__popup">
      <Space>
        {comment?.text ? <span>{comment.text}</span> : null}
        {readOnly ? null : (
          <button
            onClick={() => {
              deleteHighlight?.();
              hideTip?.();
            }}
          >
            <DeleteOutlined />
          </button>
        )}
      </Space>
    </div>
  );
};

const href = document.location.href;

interface PDFProps {
  url: string;
  authorId?: string;
  sidebarPosition?: 'left' | 'right';
  readOnly?: boolean;
  appendButtons?: (highlights: HighlightType[]) => React.ReactNode;
}

const PDF: React.FC<PDFProps> = ({
  url,
  authorId,
  sidebarPosition = 'left',
  readOnly = false,
  appendButtons,
}) => {
  // const [url, setUrl] = useState<string>(initialUrl);
  const [highlights, setHighlights] = useState<HighlightType[]>([]);
  const [strokes, setStrokes] = useState<StrokeType[]>([]);
  const [scrollViewerTo, setScrollViewerTo] = useState(
    () => (highlight: any) => {}
  );
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);

  const getHighlightById = useCallback(
    (id: string) => {
      return highlights.find((highlight) => String(highlight.id) === id);
    },
    [highlights]
  );

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());

    if (highlight) {
      scrollViewerTo(highlight);
    }
  }, [getHighlightById, scrollViewerTo]);

  useEffect(() => {
    window.addEventListener('hashchange', scrollToHighlightFromHash, false);
  }, [scrollToHighlightFromHash]);

  const getHighlights = useCallback(() => {
    if (href.startsWith(API_HOST)) {
      return sendRequest<HighlightType[]>(
        `/api/highlights?${queryParse({ url, authorId })}`,
        {
          method: 'GET',
        }
      ).then((json) => {
        setHighlights(json);
      });
    } else {
      chrome.runtime.sendMessage(
        { action: 'GET_HIGHLIGHTS', url, authorId },
        function (result: HighlightType[]) {
          setHighlights(result);
        }
      );
    }
  }, [setHighlights, url, authorId]);

  const getStrokes = useCallback(() => {
    if (href.startsWith(API_HOST)) {
      return sendRequest<StrokeType[]>(
        `/api/strokes?${queryParse({ url, authorId })}`,
        {
          method: 'GET',
        }
      ).then((json) => {
        setStrokes(json);
      });
    } else {
      chrome.runtime.sendMessage(
        { action: 'GET_STROKES', url, authorId },
        function (result: StrokeType[]) {
          setStrokes(result);
        }
      );
    }
  }, [setStrokes, url, authorId]);

  const deleteStroke = useCallback(
    (strokeId: string) => {
      if (href.startsWith(API_HOST)) {
        sendRequest(`/api/strokes/${strokeId}`, {
          method: 'DELETE',
        }).then(async () => {
          await getStrokes();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: 'DELETE_STROKE',
            strokeId,
          },
          () => {
            getStrokes();
          }
        );
      }
    },
    [getStrokes]
  );

  useEffect(() => {
    getHighlights();
    getStrokes();
  }, [getHighlights, getStrokes]);

  const updateHighlight = useCallback(
    (highlightId: string, position: object, content: object) => {
      const original = highlights.find((item) => {
        return String(item.id) === highlightId;
      });

      if (href.startsWith(API_HOST)) {
        sendRequest(`/api/highlights/${highlightId}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
          body: {
            position: { ...original?.position, ...position },
            content: { ...original?.content, ...content },
          },
        }).then(async () => {
          await getHighlights();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: 'UPDATE_HIGHLIGHT',
            highlightId,
            body: {
              position: { ...original?.position, ...position },
              content: { ...original?.content, ...content },
            },
          },
          function () {
            getHighlights();
          }
        );
      }
    },
    [highlights, getHighlights]
  );

  const deleteHighlight = useCallback(
    (highlightId: string) => {
      if (href.startsWith(API_HOST)) {
        sendRequest(`/api/highlights/${highlightId}`, {
          method: 'DELETE',
        }).then(async () => {
          await getHighlights();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: 'DELETE_HIGHLIGHT',
            highlightId,
          },
          () => {
            getHighlights();
          }
        );
      }
    },
    [getHighlights]
  );

  const onSelectionFinished: PdfHighlighterProps['onSelectionFinished'] =
    useCallback(
      (position, content, hideTipAndSelection, transformSelection) =>
        readOnly ? null : (
          <Tip
            onConfirm={async (color: string, comment?: { text: string }) => {
              transformSelection();

              if (href.startsWith(API_HOST)) {
                sendRequest(`/api/highlights`, {
                  method: 'POST',
                  headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                  },
                  body: [
                    {
                      url,
                      content,
                      position,
                      comment,
                      backgroundColor: color,
                    },
                  ],
                }).then(async () => {
                  hideTipAndSelection();
                  await getHighlights();
                });
              } else {
                chrome.runtime.sendMessage(
                  {
                    action: 'CREATE_HIGHLIGHT',
                    body: [
                      {
                        url,
                        content,
                        position,
                        comment,
                        backgroundColor: color,
                      },
                    ],
                  },
                  function () {
                    hideTipAndSelection();
                    getHighlights();
                  }
                );
              }
            }}
          />
        ),
      [getHighlights, readOnly, url]
    );

  const highlightTransform: PdfHighlighterProps['highlightTransform'] =
    useCallback(
      (
        highlight,
        index,
        setTip,
        hideTip,
        viewportToScaled,
        screenshot,
        isScrolledTo,
        isEventLayer
      ) => {
        const isTextHighlight = !(highlight.content && highlight.content.image);

        if (!isEventLayer) {
          return isTextHighlight ? (
            <Highlight
              key={highlight.id}
              isScrolledTo={isScrolledTo}
              highlight={highlight}
              backgroundColor={highlight.backgroundColor || undefined}
              isEventLayer={false}
            />
          ) : (
            <AreaHighlight
              key={highlight.id}
              isScrolledTo={isScrolledTo}
              highlight={highlight}
              isEventLayer={false}
            />
          );
        }

        const eventDiv = document.getElementById(
          `event__highlight__${highlight.id}`
        );
        const highlightDiv = document.getElementById(
          `highlight__${highlight.id}`
        );

        const component = isTextHighlight ? (
          <Highlight
            isScrolledTo={false}
            highlight={highlight}
            backgroundColor={highlight.backgroundColor || undefined}
            isEventLayer={true}
          />
        ) : (
          <AreaHighlight
            isScrolledTo={false}
            highlight={highlight}
            onChange={(boundingRect) => {
              updateHighlight(
                String(highlight.id),
                { boundingRect: viewportToScaled(boundingRect) },
                { image: screenshot(boundingRect) }
              );
            }}
            isEventLayer={true}
          />
        );

        return (
          <Popup
            popupContent={
              readOnly && !highlight.comment?.text ? (
                <></>
              ) : (
                <HighlightPopup
                  {...highlight}
                  readOnly={readOnly}
                  deleteHighlight={() => {
                    if (eventDiv) eventDiv.style.display = 'none';
                    if (highlightDiv) highlightDiv.style.display = 'none';

                    deleteHighlight(String(highlight.id));
                  }}
                  hideTip={hideTip}
                />
              )
            }
            onMouseOver={(popupContent) =>
              setTip(highlight, () => popupContent)
            }
            onMouseOut={hideTip}
            key={highlight.id}
            children={component}
          />
        );
      },
      [updateHighlight, deleteHighlight, readOnly]
    );

  const onStrokeEnd: PdfHighlighterProps['onStrokeEnd'] = useCallback(
    (payload) => {
      if (href.startsWith(API_HOST)) {
        sendRequest(`/api/strokes`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
          body: [
            {
              ...payload,
              url,
            },
          ],
        }).then(async () => {
          await getStrokes();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: 'CREATE_STROKE',
            body: [
              {
                ...payload,
                url,
              },
            ],
          },
          function () {
            getStrokes();
          }
        );
      }
    },
    [authorId, getStrokes, url]
  );

  return (
    <div
      className="PDF__container"
      style={{
        flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row',
      }}
    >
      <Sidebar
        highlights={pdfDocument ? highlights : []}
        url={url}
        pdfDocument={pdfDocument}
        appendButtons={appendButtons}
      />
      <div className="PDF__viewer">
        <PdfLoader
          url={url}
          beforeLoad={<Spinner />}
          pdfDocument={pdfDocument}
          setPdfDocument={setPdfDocument}
        >
          {pdfDocument ? (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event: MouseEvent) => event.altKey}
              onScrollChange={resetHash}
              // pdfScaleValue="page-width"
              scrollRef={(scrollTo) => {
                setScrollViewerTo(() => scrollTo);

                scrollToHighlightFromHash();
              }}
              onSelectionFinished={onSelectionFinished}
              highlightTransform={highlightTransform}
              highlights={pdfDocument ? highlights : []}
              strokes={strokes}
              onStrokeEnd={onStrokeEnd}
              deleteStroke={deleteStroke}
            />
          ) : (
            <></>
          )}
        </PdfLoader>
      </div>
      <Chatbot />
    </div>
  );
};

export default withErrorBoundaryCustom<PDFProps>(PDF);
