let openSignalPickerOnHome = false

export function requestSignalPickerOnHome(): void {
  openSignalPickerOnHome = true
}

export function consumeSignalPickerOnHome(): boolean {
  const requested = openSignalPickerOnHome
  openSignalPickerOnHome = false
  return requested
}
