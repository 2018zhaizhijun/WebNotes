import { MessageInstance } from "antd/es/message/interface";

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
