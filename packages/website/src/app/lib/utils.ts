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
