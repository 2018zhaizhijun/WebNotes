// import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
// import { createPDFAgent } from './agent';
import { queryParse } from './http';

export const extractInfo = async (pdfDocument: PDFDocumentProxy) => {
  const page = await pdfDocument.getPage(1);
  const textContent = await page.getTextContent();
  const items = textContent.items as TextItem[];

  let i = 0;
  let title = '';
  while (!(items[i].fontName === 'g_d0_f1')) {
    i += 1;
  }
  while (items[i].fontName === 'g_d0_f1') {
    const str = items[i].str;
    title = `${title}${str.endsWith('-') ? '' : ' '}${str}`;
    i += 1;
  }

  let abstract = '';
  while (!(items[i].fontName === 'g_d0_f1' && items[i].str === 'Abstract')) {
    i += 1;
  }
  i += 1;
  const fontName = items[i].fontName;
  while (items[i].fontName === fontName) {
    const str = items[i].str;
    if (items[i].str.trim()) {
      abstract = abstract.endsWith('-')
        ? abstract.slice(0, -1) + str
        : [abstract, str].join(' ');
    }
    i += 1;
  }

  return {
    title,
    abstract,
  };
};

export function getBinaryData(
  url: string,
  callback: (_pdfDoc: PDFDocumentProxy) => void
) {
  fetch(`/api/pdf?${queryParse({ url })}`, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then(async (json) => {
      // const arraybuffer = json['arraybuffer'];
      // const blob = new Blob([arraybuffer], { type: 'application/pdf' });
      // const loader = new WebPDFLoader(blob, {
      //   pdfjs: () =>
      //     import('pdfjs-dist/legacy/build/pdf.js').then((m) => m.default),
      // });
      // const docs = await loader.load();
      // // console.log(docs.length);
      // // console.log(docs[0]);
      // await createPDFAgent(docs);
      // return getDocument(arraybuffer).promise;
      return getDocument(json['arraybuffer']).promise;
    })
    .then((_pdfDoc) => {
      callback(_pdfDoc);
    })
    .catch((error) => {
      console.log('Failed to fetch the PDF file: ' + error.message);
    });
}
