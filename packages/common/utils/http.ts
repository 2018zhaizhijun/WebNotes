import { MessageInstance } from "antd/es/message/interface";
import { RcFile } from "antd/es/upload";

export const API_HOST = "https://localhost:4000";

export function queryParse(query: { [k: string]: string }): string {
  let queryText = "";

  for (let key in query) {
    queryText += `${key}=${query[key]}&`;
  }

  return queryText.slice(0, -1);
}

export async function sendRequest<T>(
  api: string,
  params: Object,
  // onSuccess: (json: Object) => void,
  messageApi: MessageInstance
): Promise<T> {
  return fetch(api, params)
    .then(async (res) => {
      if (res.status == 401) {
        messageApi.open({
          type: "error",
          content: "Unauthorized access detected",
        });
        return;
      }

      const json = await res.json();
      console.log(json);
      // await onSuccess?.(json);
      return json;
    })
    .catch((err) => {
      console.log("err:", err);
      messageApi.open({
        type: "error",
        content: err.message,
      });
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
