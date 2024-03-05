import { TextItem } from "pdfjs-dist/types/src/display/api";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import { API_HOST, queryParse } from "./http";

export const extractInfo = async (pdfDocument: PDFDocumentProxy) => {
  const page = await pdfDocument.getPage(1);
  const textContent = await page.getTextContent();
  const items = textContent.items as TextItem[];

  let i = 0;
  let title = "";
  while (!(items[i].fontName === "g_d0_f1")) {
    i += 1;
  }
  while (items[i].fontName === "g_d0_f1") {
    let str = items[i].str;
    title = `${title}${str.endsWith("-") ? "" : " "}${str}`;
    i += 1;
  }

  let abstract = "";
  while (!(items[i].fontName === "g_d0_f1" && items[i].str === "Abstract")) {
    i += 1;
  }
  i += 1;
  const fontName = items[i].fontName;
  while (items[i].fontName === fontName) {
    let str = items[i].str;
    if (items[i].str.trim()) {
      abstract = abstract.endsWith("-")
        ? abstract.slice(0, -1) + str
        : [abstract, str].join(" ");
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
  fetch(`${API_HOST}/api/pdf?${queryParse({ url })}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((json) => {
      return getDocument(json["arraybuffer"]).promise;
    })
    .then((_pdfDoc) => {
      callback(_pdfDoc);
    })
    .catch((error) => {
      console.log("Failed to fetch the PDF file: " + error.message);
    });
}
