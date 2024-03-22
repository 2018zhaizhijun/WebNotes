import parse from 'html-react-parser';
import { ReactNode } from 'react';

export const groupBy = (arr: Array<{ [k: string]: any }>, prop: string) => {
  return arr.reduce((result, item) => {
    const key = item[prop];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

export const highlightKeywords = (
  text: string,
  keywords: string
): ReactNode => {
  const keywordList = keywords.split(' ');
  const regex = new RegExp(`(${keywordList.join('|')})`, 'gi');
  return parse(text.replace(regex, '<span style="color: red">$1</span>'));
};
