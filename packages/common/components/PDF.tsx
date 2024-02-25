"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "./react-pdf-highlighter";

import { testHighlights as _testHighlights } from "./test-highlights";
import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import Tip from "./Tip";

import "./style/PDF.css";
import { DeleteOutlined } from "@ant-design/icons";
import { message } from "antd";

import { API_HOST, queryParse, sendRequest } from "../utils/http";
import { HighlightType } from "../db/prisma-json";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
  deleteHighlight,
  hideTip,
}: {
  comment?: { text: string } | null;
  deleteHighlight?: () => void;
  hideTip?: () => void;
}) => {
  return (
    <div className="Highlight__popup">
      {comment?.text ? (
        <span style={{ marginRight: "15px" }}>{comment.text}</span>
      ) : null}
      <button
        onClick={() => {
          deleteHighlight?.();
          hideTip?.();
        }}
      >
        <DeleteOutlined />
      </button>
    </div>
  );
};

const href = document.location.href;

const PDF: React.FC<{ url: string }> = ({ url }) => {
  // const [url, setUrl] = useState<string>(initialUrl);
  const [highlights, setHighlights] = useState<HighlightType[]>([]);
  const [scrollViewerTo, setScrollViewerTo] = useState(
    () => (highlight: any) => {}
  );
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

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
  }, [getHighlightById, scrollViewerTo, parseIdFromHash]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
  }, [scrollToHighlightFromHash]);

  const getHighlights = useCallback(() => {
    if (href.startsWith(API_HOST)) {
      return sendRequest<HighlightType[]>(
        `${API_HOST}/api/highlight?${queryParse({ url })}`,
        {
          method: "GET",
        },
        messageApi
      ).then((json) => {
        setHighlights(json);
      });
    } else {
      chrome.runtime.sendMessage(
        { action: "GET_HIGHLIGHTS", url, messageApi },
        function (result: HighlightType[]) {
          console.log(result);
          setHighlights(result);
        }
      );
    }
  }, [sendRequest, setHighlights, messageApi]);

  useEffect(() => {
    getHighlights();
  }, [getHighlights]);

  const updateHighlight = useCallback(
    (highlightId: string, position: Object, content: Object) => {
      console.log("Updating highlight", highlightId, position, content);

      const original = highlights.find((item, index) => {
        return String(item.id) === highlightId;
      });

      if (href.startsWith(API_HOST)) {
        sendRequest(
          `${API_HOST}/api/highlight/${highlightId}`,
          {
            method: "PUT",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              position: { ...original?.position, ...position },
              content: { ...original?.content, ...content },
            }),
          },
          messageApi
        ).then(async () => {
          await getHighlights();
        });
      } else {
        chrome.runtime.sendMessage(
          {
            action: "UPDATE_HIGHLIGHT",
            highlightId,
            messageApi,
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
    [highlights, getHighlights, sendRequest, messageApi]
  );

  return (
    <div className="PDF" style={{ display: "flex", height: "100vh" }}>
      {contextHolder}
      <Sidebar highlights={highlights} url={url} pdfDocument={pdfDocument} />
      <div
        style={{
          height: "100vh",
          width: "75vw",
          position: "relative",
        }}
      >
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
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => (
                <Tip
                  onConfirm={async (
                    color: string,
                    comment?: { text: string }
                  ) => {
                    transformSelection();

                    if (href.startsWith(API_HOST)) {
                      sendRequest(
                        `${API_HOST}/api/highlight`,
                        {
                          method: "POST",
                          headers: {
                            "Content-type": "application/json; charset=UTF-8",
                          },
                          body: JSON.stringify({
                            url,
                            content,
                            position,
                            comment,
                            backgroundColor: color,
                          }),
                        },
                        messageApi
                      ).then(async () => {
                        hideTipAndSelection();
                        await getHighlights();
                      });
                    } else {
                      chrome.runtime.sendMessage(
                        {
                          action: "CREATE_HIGHLIGHT",
                          messageApi,
                          body: JSON.stringify({
                            url,
                            content,
                            position,
                            comment,
                            backgroundColor: color,
                          }),
                        },
                        function () {
                          hideTipAndSelection();
                          getHighlights();
                        }
                      );
                    }
                  }}
                />
              )}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const isTextHighlight = !Boolean(
                  highlight.content && highlight.content.image
                );

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
                      <HighlightPopup
                        {...highlight}
                        deleteHighlight={() => {
                          if (href.startsWith(API_HOST)) {
                            sendRequest(
                              `${API_HOST}/api/highlight/${highlight.id}`,
                              {
                                method: "DELETE",
                              },
                              messageApi
                            ).then(async () => {
                              await getHighlights();
                            });
                          } else {
                            chrome.runtime.sendMessage(
                              {
                                action: "DELETE_HIGHLIGHT",
                                highlightId: highlight.id,
                                messageApi,
                              },
                              () => {
                                getHighlights();
                              }
                            );
                          }
                        }}
                        hideTip={hideTip}
                      />
                    }
                    onMouseOver={(popupContent) =>
                      setTip(highlight, (highlight) => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                    children={component}
                  />
                );
              }}
              highlights={highlights}
            />
          ) : (
            <></>
          )}
        </PdfLoader>
      </div>
    </div>
  );
};

export default PDF;
