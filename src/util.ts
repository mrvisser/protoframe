export function hasValue<V>(value: V | null | undefined): value is V {
  return value !== null && value !== undefined;
}
