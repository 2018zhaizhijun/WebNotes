export enum HTTP_CODE {
  NOT_LOGGED = 401,
  AUTHOR_NOT_FOUND = 402,
}

export const CODE_INFO: { [k in HTTP_CODE]: { message: string } } = {
  [HTTP_CODE.NOT_LOGGED]: {
    message: "Unauthorized access detected",
  },
  [HTTP_CODE.AUTHOR_NOT_FOUND]: {
    message: "Author not found",
  },
};

export function responseFail(error_code: HTTP_CODE) {
  return new Response(CODE_INFO[error_code]["message"], {
    status: error_code,
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
