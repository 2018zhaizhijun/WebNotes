import { MessageInstance } from "antd/es/message/interface";
import { RcFile } from "antd/es/upload";
import { CODE_INFO, HTTP_CODE } from "./httpcode";

export const API_HOST = "https://localhost:4000";

export function queryParse(query: { [k: string]: string | undefined }): string {
  let queryText = "";

  for (let key in query) {
    query[key] && (queryText += `${key}=${query[key]}&`);
  }

  return queryText.slice(0, -1);
}

export async function sendRequest<T>(
  api: string,
  params: Object,
  // onSuccess: (json: Object) => void,
  messageApi?: MessageInstance
): Promise<T> {
  return fetch(api, params)
    .then(async (res) => {
      if (res.status in HTTP_CODE) {
        let error_message = CODE_INFO[res.status as HTTP_CODE].message;
        console.log("err:", error_message);
        messageApi?.open({
          type: "error",
          content: error_message,
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
      messageApi?.open({
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
