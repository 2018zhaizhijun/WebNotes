/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'pdfjs-dist/web/pdf_viewer.css';
import '../style/PdfHighlighter.css';
import '../style/pdf_viewer.css';

import { Color } from 'antd/es/color-picker/color';
import { StrokeType } from 'db/prisma';
import debounce from 'lodash.debounce';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  EventBus,
  NullL10n,
  PDFLinkService,
  PDFViewer,
} from 'pdfjs-dist/legacy/web/pdf_viewer';
import React, { PointerEventHandler, PureComponent, RefObject } from 'react';
import { Root, createRoot } from 'react-dom/client';
import {
  scaledCoordToCtx,
  scaledToViewport,
  viewportToScaled,
} from '../lib/coordinates';
import getAreaAsPng from '../lib/get-area-as-png';
import {
  getBoundingRect,
  getBoundingRectFromPath,
} from '../lib/get-bounding-rect';
import getClientRects from '../lib/get-client-rects';
import {
  asElement,
  findOrCreateContainerLayer,
  getPageFromElement,
  getPagesFromRange,
  getWindow,
  isHTMLElement,
} from '../lib/pdfjs-dom';
import type {
  Coords,
  IHighlight,
  LTWH,
  LTWHP,
  Page,
  Position,
  Scaled,
  ScaledPosition,
  ScaledStrokePosition,
  StrokePosition,
} from '../types';
import { HighlightLayer } from './HighlightLayer';
import MouseSelection from './MouseSelection';
import MouseStroking from './MouseStroking';
import TipContainer from './TipContainer';
import ToolBar from './ToolBar';

export type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;

export const EditMode = {
  STROKING: 'stroking',
};

interface State<T_HT> {
  // ghostHighlight有什么作用？
  // ghostHighlight: {
  //   position: ScaledPosition;
  //   content?: { text?: string; image?: string };
  // } | null;
  isCollapsed: boolean;
  range: Range | null;
  tip: {
    highlight: T_ViewportHighlight<T_HT>;
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
  } | null;
  tipPosition: Position | null;
  tipChildren: JSX.Element | null;
  isAreaSelectionInProgress: boolean;
  scrolledToHighlightId: string;

  color: string;
  strokeWidth: number;
  activated: string;
}

interface Props<T_HT> {
  highlightTransform: (
    highlight: T_ViewportHighlight<T_HT>,
    index: number,
    setTip: (
      highlight: T_ViewportHighlight<T_HT>,
      callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element
    ) => void,
    hideTip: () => void,
    viewportToScaled: (rect: LTWHP) => Scaled,
    screenshot: (position: LTWH) => string,
    isScrolledTo: boolean
  ) => JSX.Element;
  highlights: Array<T_HT>;
  onScrollChange: () => void;
  scrollRef: (scrollTo: (highlight: T_HT) => void) => void;
  pdfDocument: PDFDocumentProxy;
  pdfScaleValue: string;
  onSelectionFinished: (
    position: ScaledPosition,
    content: { text?: string; image?: string },
    hideTipAndSelection: () => void,
    transformSelection: () => void
  ) => JSX.Element | null;
  enableAreaSelection: (event: MouseEvent) => boolean;

  strokes: Array<StrokeType>;
  onStrokeEnd: (payload: Partial<StrokeType>) => void;
}

const EMPTY_ID = 'empty-id';

export class PdfHighlighter<T_HT extends IHighlight> extends PureComponent<
  Props<T_HT>,
  State<T_HT>
> {
  static defaultProps = {
    pdfScaleValue: 'auto',
  };

  state: State<T_HT> = {
    // ghostHighlight: null,
    isCollapsed: true,
    range: null,
    scrolledToHighlightId: EMPTY_ID,
    isAreaSelectionInProgress: false,
    tip: null,
    tipPosition: null,
    tipChildren: null,

    color: '#ffe28f',
    strokeWidth: 4,
    activated: '',
  };

  eventBus = new EventBus();
  linkService = new PDFLinkService({
    eventBus: this.eventBus,
    externalLinkTarget: 2,
  });

  viewer!: PDFViewer;

  resizeObserver: ResizeObserver | null = null;
  containerNode?: HTMLDivElement | null = null;
  containerNodeRef: RefObject<HTMLDivElement>;
  highlightRoots: {
    [page: number]: { reactRoot: Root; container: Element };
  } = {};
  strokeRoots: {
    [page: number]: { canvas: HTMLCanvasElement; container: Element };
  } = {};
  unsubscribe = () => {};

  constructor(props: Props<T_HT>) {
    super(props);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.debouncedScaleValue);
    }
    this.containerNodeRef = React.createRef();
  }

  componentDidMount() {
    this.init();
  }

  attachRef = () => {
    const { eventBus, resizeObserver: observer } = this;
    const ref = (this.containerNode = this.containerNodeRef!.current);
    this.unsubscribe();

    if (ref) {
      const { ownerDocument: doc } = ref;
      eventBus.on('textlayerrendered', this.onTextLayerRendered);
      eventBus.on('pagesinit', this.onDocumentReady);
      doc.addEventListener('selectionchange', this.onSelectionChange);
      doc.addEventListener('keydown', this.handleKeyDown);
      doc.defaultView?.addEventListener('resize', this.debouncedScaleValue);
      if (observer) observer.observe(ref);

      this.unsubscribe = () => {
        eventBus.off('pagesinit', this.onDocumentReady);
        eventBus.off('textlayerrendered', this.onTextLayerRendered);
        doc.removeEventListener('selectionchange', this.onSelectionChange);
        doc.removeEventListener('keydown', this.handleKeyDown);
        doc.defaultView?.removeEventListener(
          'resize',
          this.debouncedScaleValue
        );
        if (observer) observer.disconnect();
      };
    }
  };

  componentDidUpdate(prevProps: Props<T_HT>) {
    if (prevProps.pdfDocument !== this.props.pdfDocument) {
      this.init();
      return;
    }
    if (prevProps.highlights !== this.props.highlights) {
      this.renderHighlightLayers();
    }
    if (prevProps.strokes !== this.props.strokes) {
      this.renderStrokeLayers();
    }
  }

  init() {
    const { pdfDocument } = this.props;
    this.attachRef();

    this.viewer =
      this.viewer ||
      new PDFViewer({
        container: this.containerNodeRef!.current!,
        eventBus: this.eventBus,
        // enhanceTextSelection: true, // deprecated. https://github.com/mozilla/pdf.js/issues/9943#issuecomment-409369485
        textLayerMode: 1, // 0: DISABLE  1: ENABLE  2: ENBALE_ENHANCE (not maintained anymore)
        removePageBorders: true,
        linkService: this.linkService,
        l10n: NullL10n,
      });

    this.linkService.setDocument(pdfDocument);
    this.linkService.setViewer(this.viewer);
    this.viewer.setDocument(pdfDocument);
    // debug
    (window as any).PdfViewer = this;
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  findOrCreateHighlightLayer(page: number) {
    const { textLayer } = this.viewer.getPageView(page - 1) || {};

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      'PdfHighlighter__highlight-layer'
    );
  }

  groupHighlightsByPage(highlights: Array<T_HT>): {
    [pageNumber: string]: Array<T_HT>;
  } {
    // const { ghostHighlight } = this.state;

    const allHighlights = [...highlights].filter(Boolean);

    const pageNumbers = new Set<number>();
    for (const highlight of allHighlights) {
      pageNumbers.add(highlight.position.pageNumber);
      for (const rect of highlight.position.rects) {
        if (rect.pageNumber) {
          pageNumbers.add(rect.pageNumber);
        }
      }
    }

    const groupedHighlights = {} as Record<number, any[]>;

    for (const pageNumber of pageNumbers) {
      groupedHighlights[pageNumber] = groupedHighlights[pageNumber] || [];
      for (const highlight of allHighlights) {
        const pageSpecificHighlight = {
          ...highlight,
          position: {
            pageNumber,
            boundingRect: highlight.position.boundingRect,
            rects: [],
            usePdfCoordinates: highlight.position.usePdfCoordinates,
          } as ScaledPosition,
        };
        let anyRectsOnPage = false;
        for (const rect of highlight.position.rects) {
          if (
            pageNumber === (rect.pageNumber || highlight.position.pageNumber)
          ) {
            pageSpecificHighlight.position.rects.push(rect);
            anyRectsOnPage = true;
          }
        }
        if (anyRectsOnPage || pageNumber === highlight.position.pageNumber) {
          groupedHighlights[pageNumber].push(pageSpecificHighlight);
        }
      }
    }

    return groupedHighlights;
  }

  groupStrokesByPage(strokes: Array<StrokeType>): {
    [pageNumber: string]: Array<StrokeType>;
  } {
    const allStrokes = [...strokes].filter(Boolean);

    const pageNumbers = new Set<number>();
    for (const stroke of allStrokes) {
      pageNumbers.add(stroke.position.pageNumber);
      if (stroke.position.boundingRect.pageNumber) {
        pageNumbers.add(stroke.position.boundingRect.pageNumber);
      }
    }

    const groupedStrokes = {} as Record<number, any[]>;

    for (const pageNumber of pageNumbers) {
      groupedStrokes[pageNumber] = groupedStrokes[pageNumber] || [];
      for (const stroke of allStrokes) {
        if (pageNumber === stroke.position.pageNumber) {
          groupedStrokes[pageNumber].push(stroke);
        }
      }
    }

    return groupedStrokes;
  }

  showTip(highlight: T_ViewportHighlight<T_HT>, content: JSX.Element) {
    const { isCollapsed, isAreaSelectionInProgress } = this.state;

    const highlightInProgress = !isCollapsed; //  || ghostHighlight;

    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }

    this.setTip(highlight.position, content);
  }

  scaledPositionToViewport(position: ScaledPosition): Position {
    const { pageNumber, boundingRect, usePdfCoordinates } = position;
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (position.rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber,
    };
  }

  scaledStrokePositionToViewport(
    position: ScaledStrokePosition,
    canvas: HTMLCanvasElement
  ): StrokePosition {
    const { pageNumber, boundingRect, usePdfCoordinates } = position;
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      path: scaledCoordToCtx(
        position.path,
        // viewport,
        // usePdfCoordinates,
        canvas
      ),
      pageNumber,
    };
  }

  viewportPositionToScaled({
    pageNumber,
    boundingRect,
    rects,
  }: Position): ScaledPosition {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map((rect) => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  }

  screenshot(position: LTWH, pageNumber: number) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;

    return getAreaAsPng(canvas, position);
  }

  hideTipAndSelection = () => {
    this.setState({
      tipPosition: null,
      tipChildren: null,
    });

    this.setState({ tip: null }, () => this.renderHighlightLayers());
  };

  setTip(position: Position, inner: JSX.Element | null) {
    this.setState({
      tipPosition: position,
      tipChildren: inner,
    });
  }

  renderTip = () => {
    const { tipPosition, tipChildren } = this.state;
    if (!tipPosition) return null;

    const { boundingRect, pageNumber } = tipPosition;
    const page = {
      node: this.viewer.getPageView((boundingRect.pageNumber || pageNumber) - 1)
        .div,
      pageNumber: boundingRect.pageNumber || pageNumber,
    };

    const pageBoundingClientRect = page.node.getBoundingClientRect();

    const pageBoundingRect = {
      bottom: pageBoundingClientRect.bottom,
      height: pageBoundingClientRect.height,
      left: pageBoundingClientRect.left,
      right: pageBoundingClientRect.right,
      top: pageBoundingClientRect.top,
      width: pageBoundingClientRect.width,
      x: pageBoundingClientRect.x,
      y: pageBoundingClientRect.y,
      pageNumber: page.pageNumber,
    };

    return (
      <TipContainer
        scrollTop={this.viewer.container.scrollTop}
        pageBoundingRect={pageBoundingRect}
        style={{
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
        }}
      >
        {tipChildren}
      </TipContainer>
    );
  };

  onTextLayerRendered = () => {
    this.renderHighlightLayers();
    this.renderStrokeLayers();
  };

  scrollTo = (highlight: T_HT) => {
    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

    this.viewer.container.removeEventListener('scroll', this.onScroll);

    const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    this.viewer.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: 'XYZ' },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin
        ),
        0,
      ],
    });

    this.setState(
      {
        scrolledToHighlightId: String(highlight.id),
      },
      () => this.renderHighlightLayers()
    );

    // wait for scrolling to finish
    setTimeout(() => {
      this.viewer.container.addEventListener('scroll', this.onScroll);
    }, 100);
  };

  onDocumentReady = () => {
    const { scrollRef } = this.props;

    this.handleScaleValue();

    scrollRef(this.scrollTo);
  };

  onSelectionChange = () => {
    const container = this.containerNode;
    const selection = getWindow(container).getSelection();

    if (!selection) {
      return;
    }

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (selection.isCollapsed) {
      this.setState({ isCollapsed: true });
      return;
    }

    if (
      !range ||
      !container ||
      !container.contains(range.commonAncestorContainer)
    ) {
      return;
    }

    this.setState({
      isCollapsed: false,
      range,
    });

    this.debouncedAfterSelection();
  };

  onScroll = () => {
    const { onScrollChange } = this.props;

    onScrollChange();

    this.setState(
      {
        scrolledToHighlightId: EMPTY_ID,
      },
      () => this.renderHighlightLayers()
    );

    this.viewer.container.removeEventListener('scroll', this.onScroll);
  };

  onMouseDown: PointerEventHandler = (event) => {
    if (!isHTMLElement(event.target)) {
      return;
    }

    if (asElement(event.target).closest('.PdfHighlighter__tip-container')) {
      return;
    }

    this.hideTipAndSelection();
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      this.hideTipAndSelection();
    }
  };

  afterSelection = () => {
    const { onSelectionFinished } = this.props;

    const { isCollapsed, range } = this.state;

    if (!range || isCollapsed) {
      return;
    }

    const pages = getPagesFromRange(range);

    if (!pages || pages.length === 0) {
      return;
    }

    const rects = getClientRects(range, pages);

    if (rects.length === 0) {
      return;
    }

    const boundingRect = getBoundingRect(rects);

    const viewportPosition: Position = {
      boundingRect,
      rects,
      pageNumber: pages[0].number,
    };

    const content = {
      text: range.toString(),
    };
    const scaledPosition = this.viewportPositionToScaled(viewportPosition);

    this.setTip(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => this.hideTipAndSelection(),
        () => this.renderHighlightLayers()
        // this.setState(
        //   {
        //     // ghostHighlight: { position: scaledPosition },
        //   },
        //   () => this.renderHighlightLayers()
        // )
      )
    );
  };

  debouncedAfterSelection: () => void = debounce(this.afterSelection, 500);

  toggleTextSelection(flag: boolean) {
    this.viewer.viewer!.classList.toggle(
      'PdfHighlighter--disable-selection',
      flag
    );
  }

  handleScaleValue = () => {
    if (this.viewer) {
      this.viewer.currentScaleValue = this.props.pdfScaleValue; //"page-width";
    }
  };

  debouncedScaleValue: () => void = debounce(this.handleScaleValue, 500);

  onColorChange = (color: Color) => {
    this.setState({ color: '#' + color.toHex() });
  };

  onStrokeWidthChange = (width: number) => {
    this.setState({ strokeWidth: width });
  };

  render() {
    const { onSelectionFinished, enableAreaSelection, onStrokeEnd } =
      this.props;

    return (
      <div onPointerDown={this.onMouseDown}>
        <ToolBar
          color={this.state.color}
          strokeWidth={this.state.strokeWidth}
          activated={this.state.activated}
          onColorChange={this.onColorChange}
          onStrokeWidthChange={this.onStrokeWidthChange}
          setActivated={(mode: string) => {
            this.setState({ activated: mode });
          }}
        />
        <div
          ref={this.containerNodeRef}
          className="PdfHighlighter"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="pdfViewer" />
          {this.renderTip()}
          {typeof enableAreaSelection === 'function' &&
          this.state.activated !== EditMode.STROKING ? (
            <MouseSelection
              onDragStart={() => this.toggleTextSelection(true)}
              onDragEnd={() => this.toggleTextSelection(false)}
              onChange={(isVisible) =>
                this.setState({ isAreaSelectionInProgress: isVisible })
              }
              shouldStart={(event) =>
                enableAreaSelection(event) &&
                isHTMLElement(event.target) &&
                Boolean(asElement(event.target).closest('.page'))
              }
              onSelection={(startTarget, boundingRect, resetSelection) => {
                const page = getPageFromElement(startTarget);

                if (!page) {
                  return;
                }

                const pageBoundingRect = {
                  ...boundingRect,
                  top: boundingRect.top - page.node.offsetTop,
                  left: boundingRect.left - page.node.offsetLeft,
                  pageNumber: page.number,
                };

                const viewportPosition = {
                  boundingRect: pageBoundingRect,
                  rects: [],
                  pageNumber: page.number,
                };

                const scaledPosition =
                  this.viewportPositionToScaled(viewportPosition);

                const image = this.screenshot(
                  pageBoundingRect,
                  pageBoundingRect.pageNumber
                );

                this.setTip(
                  viewportPosition,
                  onSelectionFinished(
                    scaledPosition,
                    { image },
                    () => this.hideTipAndSelection(),
                    () => {
                      // console.log("setting ghost highlight", scaledPosition);
                      resetSelection();
                      this.renderHighlightLayers();
                      // this.setState(
                      //   {
                      //     // ghostHighlight: {
                      //     //   position: scaledPosition,
                      //     //   content: { image },
                      //     // },
                      //   },
                      //   () => {
                      //     resetSelection();
                      //     this.renderHighlightLayers();
                      //   }
                      // );
                    }
                  )
                );
              }}
            />
          ) : null}
          {this.state.activated === EditMode.STROKING ? (
            <MouseStroking
              color={this.state.color}
              strokeWidth={this.state.strokeWidth}
              onStrokeEnd={(page: Page, path: Array<Coords>) => {
                // const page = getPageFromElement(startTarget);

                // if (!page) {
                //   return;
                // }

                const boundingRect = getBoundingRectFromPath(path, page.number);
                const pageRect = page.node.getBoundingClientRect();

                onStrokeEnd({
                  position: {
                    path: {
                      coords: path,
                      width: pageRect.width,
                      height: pageRect.height,
                    },
                    boundingRect: {
                      ...boundingRect,
                      width: pageRect.width,
                      height: pageRect.height,
                    } as Scaled,
                    pageNumber: page.number,
                  },
                  color: this.state.color,
                  strokeWidth: this.state.strokeWidth,
                });
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }

  private renderHighlightLayers() {
    const { pdfDocument } = this.props;
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightRoot = this.highlightRoots[pageNumber];
      /** Need to check if container is still attached to the DOM as PDF.js can unload pages. */
      if (highlightRoot && highlightRoot.container.isConnected) {
        this.renderHighlightLayer(highlightRoot.reactRoot, pageNumber);
      } else {
        const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);
        if (highlightLayer) {
          const reactRoot = createRoot(highlightLayer);
          this.highlightRoots[pageNumber] = {
            reactRoot,
            container: highlightLayer,
          };
          this.renderHighlightLayer(reactRoot, pageNumber);
        }
      }
    }
  }

  private renderHighlightLayer(root: Root, pageNumber: number) {
    const { highlightTransform, highlights } = this.props;
    const { tip, scrolledToHighlightId } = this.state;
    root.render(
      <HighlightLayer
        highlightsByPage={this.groupHighlightsByPage(highlights)}
        pageNumber={pageNumber.toString()}
        scrolledToHighlightId={scrolledToHighlightId}
        highlightTransform={highlightTransform}
        tip={tip}
        scaledPositionToViewport={this.scaledPositionToViewport.bind(this)}
        hideTipAndSelection={this.hideTipAndSelection.bind(this)}
        viewer={this.viewer}
        screenshot={this.screenshot.bind(this)}
        showTip={this.showTip.bind(this)}
        setState={this.setState.bind(this)}
      />
    );
  }

  private renderStrokeLayers() {
    const { pdfDocument, strokes } = this.props;
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const strokeRoot = this.strokeRoots[pageNumber];

      const strokesByPage = this.groupStrokesByPage(strokes);
      const pageStrokes = strokesByPage[String(pageNumber)] || [];

      /** Need to check if container is still attached to the DOM as PDF.js can unload pages. */
      if (strokeRoot && strokeRoot.container.isConnected) {
        this.renderStrokeLayer(strokeRoot.canvas, pageStrokes);
      } else {
        const strokeLayer = this.findOrCreateHighlightLayer(pageNumber);
        if (strokeLayer) {
          const canvas = document.getElementsByTagName('canvas')[
            pageNumber - 1
          ] as HTMLCanvasElement;
          this.strokeRoots[pageNumber] = {
            canvas,
            container: strokeLayer,
          };
          this.renderStrokeLayer(canvas, pageStrokes);
        }
      }
    }
  }

  private renderStrokeLayer(
    canvas: HTMLCanvasElement,
    pageStrokes: Array<StrokeType>
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    pageStrokes.forEach((stroke) => {
      const { color, strokeWidth } = stroke;
      const path = this.scaledStrokePositionToViewport(
        stroke.position,
        canvas
      ).path;

      ctx.strokeStyle = color || 'black';
      ctx.lineWidth = strokeWidth;

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }

      ctx.stroke();
    });
  }
}
