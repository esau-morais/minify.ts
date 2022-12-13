export const cx = (
  ...classNames: Array<false | null | undefined | string>
) => {
  return classNames.filter(Boolean).join(' ')
}
