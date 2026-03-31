/**
 * Image splitting utility.
 * Given an HTMLImageElement, draws each of the 9 tiles onto
 * separate canvases and returns their data URLs for use as tile backgrounds.
 *
 * @param {HTMLImageElement} img - Loaded image element
 * @param {number} size - Pixel size of each tile (e.g. 160)
 * @returns {string[]} Array of 9 data URLs (index 0 = top-left, etc.)
 */
export function splitImageIntoTiles(img, size = 160) {
  const tiles = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Draw just the slice of the original image that belongs to this tile
      ctx.drawImage(
        img,
        (col / 3) * img.naturalWidth,       // source x
        (row / 3) * img.naturalHeight,       // source y
        img.naturalWidth / 3,                // source width
        img.naturalHeight / 3,               // source height
        0, 0, size, size                     // dest (fill full tile canvas)
      );

      tiles.push(canvas.toDataURL());
    }
  }
  return tiles;
}
