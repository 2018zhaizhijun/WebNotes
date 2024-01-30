"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "./react-pdf-highlighter";

import type { IHighlight, NewHighlight } from "./react-pdf-highlighter";

import { testHighlights as _testHighlights } from "./test-highlights";
import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import Tip from "./Tip";

import "./style/PDF.css";
import styled from 'styled-components'
import { DeleteOutlined } from "@ant-design/icons";


const testHighlights: Record<string, Array<IHighlight>> = _testHighlights;

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

// const StyledButton = styled.button`
//   position: relative;
//   top: -4px;
// `

const HighlightPopup = ({
  comment,
  deleteHighlight,
  hideTip
}: {
  comment?: { text: string };
  deleteHighlight?: () => void;
  hideTip?: () => void;
}) => {
  return (
      <div className="Highlight__popup">
        {comment?.text ? <span style={{marginRight: '15px'}}>{comment.text}</span> : null}
        <button onClick={ () => {
          deleteHighlight?.();
          hideTip?.();
        }}>
          <DeleteOutlined />
        </button>
      </div>
    )
}

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const searchParams = new URLSearchParams(document.location.search);

const initialUrl = searchParams.get("url") || PRIMARY_PDF_URL;

export default function PDF() {

  const [url, setUrl] = useState<string>(initialUrl);
  const [highlights, setHighlights] = useState<Array<IHighlight>>(testHighlights[initialUrl]
                                                                  ? [...testHighlights[initialUrl]]
                                                                  : []);
  const [scrollViewerTo, setScrollViewerTo] = useState(() => (highlight: any) => {});

  const resetHighlights = useCallback(() => {
    setHighlights([])
  }, [setHighlights]);

  const toggleDocument = useCallback(() => {
    const newUrl =
      url === PRIMARY_PDF_URL ? SECONDARY_PDF_URL : PRIMARY_PDF_URL;

    setUrl(newUrl);
    setHighlights(testHighlights[newUrl] ? [...testHighlights[newUrl]] : []);
  }, [url, setUrl, setHighlights, testHighlights]);

  const getHighlightById = useCallback((id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  }, [highlights]);

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());

    if (highlight) {
      scrollViewerTo(highlight);
    }
  }, [getHighlightById, scrollViewerTo]);

  useEffect(() => {
    window.addEventListener(
      "hashchange",
      scrollToHighlightFromHash,
      false
    );
  }, [scrollToHighlightFromHash]);

  const addHighlight = useCallback((highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);

    setHighlights((prevHighlights)=>[{ ...highlight, id: getNextId() }, ...prevHighlights]);
  }, [highlights, setHighlights]);

  // const deleteHighlight = useCallback((id: string) => {
  //   console.log("Deleting highlight", id);

  //   setHighlights(highlights.filter((highlight) => highlight.id !== id));
  // }, [highlights]);

  const updateHighlight = useCallback((highlightId: string, position: Object, content: Object) => {
    console.log("Updating highlight", highlightId, position, content);

    setHighlights(highlights.map((h) => {
      const {
        id,
        position: originalPosition,
        content: originalContent,
        ...rest
      } = h;
      return id === highlightId
        ? {
            id,
            position: { ...originalPosition, ...position },
            content: { ...originalContent, ...content },
            ...rest,
          }
        : h;
    }))
  }, [highlights, setHighlights]);

  return (
    <div className="PDF" style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        highlights={highlights}
        resetHighlights={resetHighlights}
        toggleDocument={toggleDocument}
      />
      <div
        style={{
          height: "100vh",
          width: "75vw",
          position: "relative",
        }}
      >
        <PdfLoader url={url} beforeLoad={<Spinner />}>
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event: MouseEvent) => event.altKey}
              onScrollChange={resetHash}
              // pdfScaleValue="page-width"
              scrollRef={(scrollTo) => {
                // scrollViewerTo = scrollTo;
                setScrollViewerTo(()=>scrollTo);

                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => (
                <Tip
                  // onOpen={transformSelection}
                  // onConfirm={(comment) => {
                  //   this.addHighlight({ content, position, comment });

                  //   hideTipAndSelection();
                  // }}
                  onConfirm={(color: string, comment?: {text: string} ):void => {
                    transformSelection();
                    addHighlight({ content, position, comment, backgroundColor: color });
                    
                    hideTipAndSelection();
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
                    comment={highlight.comment}
                    backgroundColor={highlight.backgroundColor}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );

                return (
                  <Popup
                    popupContent={<HighlightPopup 
                      {...highlight} 
                      deleteHighlight={() => {
                        setHighlights(highlights.filter((item) => item.id !== highlight.id));
                      }}
                      hideTip={hideTip}
                     />}
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
          )}
        </PdfLoader>
      </div>
    </div>
  );
}
