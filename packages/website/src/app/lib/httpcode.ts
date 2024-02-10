import { MessageInstance } from "antd/es/message/interface";

export enum HTTP_CODE {
  NOT_LOGGED,
}

const CODE_INFO: { [k in HTTP_CODE]: { status: number; message: string } } = {
  [HTTP_CODE.NOT_LOGGED]: {
    status: 401,
    message: "Unauthorized access detected",
  },
};

export function responseFail(error_code: HTTP_CODE) {
  return new Response(CODE_INFO[error_code]["message"], {
    status: CODE_INFO[error_code]["status"],
  });
}

export function toObject(obj: Object) {
  return JSON.parse(
    JSON.stringify(
      obj,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    )
  );
}
