import React, { Component } from 'react';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { getBinaryData } from '../../../utils/pdf';

interface Props {
  /** See `GlobalWorkerOptionsType`. */
  workerSrc: string;

  url: string;
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;

  pdfDocument: PDFDocumentProxy | null;
  setPdfDocument: (pdfDocument: PDFDocumentProxy | null) => void;
}

interface State {
  // pdfDocument: PDFDocumentProxy | null;
  error: Error | null;
}

export class PdfLoader extends Component<Props, State> {
  state: State = {
    // pdfDocument: null,
    error: null,
  };

  static defaultProps = {
    workerSrc: 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js',
  };

  documentRef = React.createRef<HTMLElement>();

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    const { pdfDocument: discardedDocument } = this.props;
    if (discardedDocument) {
      discardedDocument.destroy();
      this.props.setPdfDocument(null);
    }
  }

  componentDidUpdate({ url }: Props) {
    if (this.props.url !== url) {
      this.load();
    }
  }

  componentDidCatch(error: Error) {
    const { onError } = this.props;

    if (onError) {
      onError(error);
    }

    this.props.setPdfDocument(null);
    this.setState({ error });
  }

  load() {
    const { ownerDocument = document } = this.documentRef.current || {};
    const {
      url,
      cMapUrl,
      cMapPacked,
      workerSrc,
      pdfDocument: discardedDocument,
    } = this.props;
    this.setState({ error: null });
    this.props.setPdfDocument(null);

    if (typeof workerSrc === 'string') {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    Promise.resolve()
      .then(() => discardedDocument && discardedDocument.destroy())
      .then(() => {
        if (!url) {
          return;
        }

        getDocument({
          ...this.props,
          ownerDocument,
          cMapUrl,
          cMapPacked,
        })
          .promise.then((pdfDocument) => {
            this.props.setPdfDocument(pdfDocument);
          })
          .catch(() => {
            getBinaryData(url, (pdfDocument: PDFDocumentProxy) => {
              this.props.setPdfDocument(pdfDocument);
            });
          });
      })
      .catch((e) => this.componentDidCatch(e));
  }

  render() {
    const { children, beforeLoad, pdfDocument } = this.props;
    const { error } = this.state;
    return (
      <>
        <span ref={this.documentRef} />
        {error
          ? this.renderError()
          : !pdfDocument || !children
          ? beforeLoad
          : children}
      </>
    );
  }

  renderError() {
    const { errorMessage } = this.props;
    if (errorMessage) {
      return React.cloneElement(errorMessage, { error: this.state.error });
    }

    return null;
  }
}

export default PdfLoader;
