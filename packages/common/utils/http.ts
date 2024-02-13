import { MessageInstance } from "antd/es/message/interface";
import { RcFile } from "antd/es/upload";

export function queryParse(query: { [k: string]: string }): string {
  let queryText = "";

  for (let key in query) {
    queryText += `${key}=${query[key]}&`;
  }

  return queryText.slice(0, -1);
}

export async function sendRequest(
  api: string,
  params: Object,
  onSuccess: (json: Object) => void,
  messageApi: MessageInstance
): Promise<void> {
  fetch(api, params)
    .then((res) => res.json())
    .then(async (json) => {
      console.log(json);
      await onSuccess?.(json);
    })
    .catch((err) => {
      messageApi.open({
        type: "error",
        content: err.message,
      });
      console.log("err:", err);
    });
}

// export const getBase64 = (img: FileType, callback: (url: string) => void) => {
//   const reader = new FileReader();
//   reader.addEventListener("load", () => callback(reader.result as string));
//   reader.readAsDataURL(img);
// };

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
