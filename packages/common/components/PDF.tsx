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
import { HighlightType } from '../db/prisma';
import { withErrorBoundaryCustom } from '../utils/error';
import { API_HOST, queryParse, sendRequest } from '../utils/http';

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
        `${API_HOST}/api/highlights?${queryParse({ url, authorId })}`,
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

  useEffect(() => {
    getHighlights();
  }, [getHighlights]);

  const updateHighlight = useCallback(
    (highlightId: string, position: object, content: object) => {
      const original = highlights.find((item) => {
        return String(item.id) === highlightId;
      });

      if (href.startsWith(API_HOST)) {
        sendRequest(`${API_HOST}/api/highlights/${highlightId}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({
            position: { ...original?.position, ...position },
            content: { ...original?.content, ...content },
          }),
        }).then(async () => {
          await getHighlights();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: 'UPDATE_HIGHLIGHT',
            highlightId,
            body: JSON.stringify({
              position: { ...original?.position, ...position },
              content: { ...original?.content, ...content },
            }),
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
        sendRequest(`${API_HOST}/api/highlights/${highlightId}`, {
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
                sendRequest(`${API_HOST}/api/highlights`, {
                  method: 'POST',
                  headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                  },
                  body: JSON.stringify([
                    {
                      url,
                      content,
                      position,
                      comment,
                      backgroundColor: color,
                    },
                  ]),
                }).then(async () => {
                  hideTipAndSelection();
                  await getHighlights();
                });
              } else {
                chrome.runtime.sendMessage(
                  {
                    action: 'CREATE_HIGHLIGHT',
                    body: JSON.stringify([
                      {
                        url,
                        content,
                        position,
                        comment,
                        backgroundColor: color,
                      },
                    ]),
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
        isScrolledTo
      ) => {
        const isTextHighlight = !(highlight.content && highlight.content.image);

        const component = isTextHighlight ? (
          <Highlight
            isScrolledTo={isScrolledTo}
            position={highlight.position}
            backgroundColor={highlight.backgroundColor || undefined}
          />
        ) : (
          <AreaHighlight
            isScrolledTo={isScrolledTo}
            highlight={highlight}
            onChange={(boundingRect) => {
              updateHighlight(
                String(highlight.id),
                { boundingRect: viewportToScaled(boundingRect) },
                { image: screenshot(boundingRect) }
              );
            }}
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
                  deleteHighlight={() => deleteHighlight(String(highlight.id))}
                  hideTip={hideTip}
                />
              )
            }
            onMouseOver={(popupContent) =>
              setTip(highlight, () => popupContent)
            }
            onMouseOut={hideTip}
            key={index}
            children={component}
          />
        );
      },
      [updateHighlight, deleteHighlight, readOnly]
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
            />
          ) : (
            <></>
          )}
        </PdfLoader>
      </div>
    </div>
  );
};

export default withErrorBoundaryCustom<PDFProps>(PDF);
