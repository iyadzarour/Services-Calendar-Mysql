export function isValidNumber(value: any) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

export function isEmptyObject(obj: Object) {
  return Object.keys(obj).length === 0;
}
