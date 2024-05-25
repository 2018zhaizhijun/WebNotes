import { message } from 'antd';
import { RcFile } from 'antd/es/upload';

export const API_HOST = 'https://localhost:4000';

export function queryParse(query: { [k: string]: string | undefined }): string {
  let queryText = '';

  for (const key in query) {
    query[key] && (queryText += `${key}=${query[key]}&`);
  }

  return queryText.slice(0, -1);
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

async function handleResponse(response: Response) {
  const isJson = response.headers
    ?.get('content-type')
    ?.includes('application/json');
  const data = isJson ? await response.json() : null;

  // check for error response
  if (!response.ok) {
    if (response.status == 401) {
      // api auto logs out on 401 Unauthorized, so redirect to login page
      message.info('Please log in');
      // window.open(`${API_HOST}/login`, '_blank');
    }

    // get error message from body or default to response status
    const error =
      (data && `${data.code}: ${data.message}`) || response.statusText;
    return Promise.reject(error);
  }

  return data;
}

export async function sendRequest<T>(
  api: string,
  params: object
  // onSuccess: (json: Object) => void,
): Promise<T> {
  return fetch(api, params)
    .then(handleResponse)
    .catch((error) => {
      console.error(`Request error
                  api: ${api}
                  params: ${JSON.stringify(params)}
                  error: ${error}`);
    });
}
