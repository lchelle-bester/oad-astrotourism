"""Reference script: how the design mock-up's mountain cut-out was made.

Usage: python make-mountain-cutout.py <frame.png> <out.png>

Input: one frame of the hero video at 1920 x 1082 (already brightened).
Output: a PNG the same size as the frame, with the sky transparent and the
mountains kept, so it can sit on top of the video with the same object-fit.

Needs Pillow, NumPy and SciPy.
"""
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, median_filter

# Rows to search for the ridge line, in 1080p frame pixels.
SEARCH_TOP, SEARCH_BOTTOM = 830, 1020
MAX_STEP = 3          # how far the ridge may move up or down per column
STEP_PENALTY = 0.15   # discourages a jagged ridge


def find_ridge(rgb):
    """Return the ridge height (row) for every column of the frame."""
    grey = rgb.astype(float).mean(axis=2)
    grey = gaussian_filter(median_filter(grey, 7), 1.5)  # remove stars, then smooth
    edge = np.clip(np.diff(grey, axis=0)[SEARCH_TOP:SEARCH_BOTTOM], 0, None)
    rows, width = edge.shape

    # Smoothest path from left to right that follows the strongest sky-to-mountain edge.
    cost = np.full((rows, width), 1e9)
    back = np.zeros((rows, width), int)
    cost[:, 0] = -edge[:, 0]
    for x in range(1, width):
        best = np.full(rows, 1e9)
        arg = np.zeros(rows, int)
        for d in range(-MAX_STEP, MAX_STEP + 1):
            shifted = np.roll(cost[:, x - 1], d)
            if d > 0:
                shifted[:d] = 1e9
            if d < 0:
                shifted[d:] = 1e9
            candidate = shifted + STEP_PENALTY * abs(d)
            better = candidate < best
            best[better] = candidate[better]
            arg[better] = (np.arange(rows) - d)[better]
        cost[:, x] = best - edge[:, x]
        back[:, x] = arg

    ridge = np.zeros(width, int)
    ridge[-1] = np.argmin(cost[:, -1])
    for x in range(width - 1, 0, -1):
        ridge[x - 1] = back[ridge[x], x]
    return gaussian_filter(ridge.astype(float) + SEARCH_TOP, 1.5)


def main(frame_path, out_path):
    frame = Image.open(frame_path).convert("RGB")
    rgb = np.asarray(frame)
    ridge = find_ridge(rgb)
    rows = np.arange(rgb.shape[0])[:, None]
    # Soft 2.5px edge just below the ridge line.
    alpha = np.clip((rows - (ridge[None, :] + 1)) * 255 / 2.5, 0, 255).astype(np.uint8)
    cutout = frame.copy()
    cutout.putalpha(Image.fromarray(alpha))
    cutout.save(out_path, optimize=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
