//@noflow

export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha || alpha === 0) {
    const _alpha = Math.max(Math.min(alpha, 1), 0);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + _alpha + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
