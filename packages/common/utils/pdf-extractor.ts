import { TextItem } from "pdfjs-dist/types/src/display/api";
import type { PDFDocumentProxy } from "pdfjs-dist";

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
