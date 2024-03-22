import { RcFile } from 'antd/es/upload';
import { CODE_INFO, HTTP_CODE } from './httpcode';

export const API_HOST = process.env.NEXT_PUBLIC_DEV_HOST;

export function queryParse(query: { [k: string]: string | undefined }): string {
  let queryText = '';

  for (const key in query) {
    query[key] && (queryText += `${key}=${query[key]}&`);
  }

  return queryText.slice(0, -1);
}

export async function sendRequest<T>(
  api: string,
  params: object
  // onSuccess: (json: Object) => void,
): Promise<T> {
  return fetch(api, params)
    .then(async (res) => {
      if (res.status in HTTP_CODE) {
        const error_message = CODE_INFO[res.status as HTTP_CODE].message;
        console.log('err:', error_message);
        alert(`error: ${error_message}`);
        return;
      }

      const json = await res.json();
      console.log(json);
      // await onSuccess?.(json);
      return json;
    })
    .catch((err) => {
      console.log('err:', err);
      alert(`error: ${err.message}`);
    });
}

export const getBase64 = (img: RcFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(img);
  });
};
