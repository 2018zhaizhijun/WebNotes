import { message } from 'antd';
import { RcFile } from 'antd/es/upload';

export const API_HOST = 'https://localhost:4000';

const throttleApis: { [k: string]: { data: object[]; delay: boolean } } = {
  'POST:/api/highlights': {
    data: [],
    delay: false,
  },
  'POST:/api/strokes': {
    data: [],
    delay: false,
  },
  'DELETE:/api/strokes': {
    data: [],
    delay: false,
  },
};

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
  params: { [k: string]: any }
  // onSuccess: (json: Object) => void,
): Promise<T> {
  let req_api = api,
    data = params.body,
    method = params.method?.toUpperCase();
  if (method === 'DELETE') {
    const idx = api.lastIndexOf('/');
    req_api = api.slice(0, idx);
    data = [api.slice(idx + 1)];
  }

  let uri = method + ':' + req_api,
    cache = throttleApis[uri],
    body: any = params.body;
  if (cache) {
    if (cache.delay) {
      throttleApis[uri].data = cache.data.concat(data || []);
      return new Promise(() => {});
    } else {
      body = cache.data.concat(data || []);
      throttleApis[uri].data = [];
      throttleApis[uri].delay = true;
      setTimeout(() => {
        throttleApis[uri].delay = false;
      }, 1000);
    }
  }

  return fetch(API_HOST + req_api, { ...params, body: JSON.stringify(body) })
    .then(handleResponse)
    .catch((error) => {
      console.error(`Request error
                  api: ${api}
                  params: ${JSON.stringify(params)}
                  error: ${error}`);
    });
}
