// A single image covers the safe area and teacher navigation together.
export function teacherHeaderLayout(width: number, topInset: number) {
  const phone = width < 768;
  const height = (phone ? Math.min(230, width * 0.56) : Math.max(210, (width * 222) / 900)) + topInset;
  const imageWidth = phone ? (height * 1602) / 394 : width;
  return { position: 'absolute' as const, top: 0, left: phone ? -imageWidth * 0.12 : 0, width: imageWidth, height };
}
