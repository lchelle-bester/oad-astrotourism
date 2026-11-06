# Makes the site's tab icons from the official OAD symbol on its black square
# (site/assets/images/logos/oad-symbol-colour-on-black-300.jpg). Not part of the normal
# build: run it by hand to remake them (python build/make-favicon.py).
# The logo is never recoloured, redrawn or cropped: the file is only scaled down.
# Made 6 Nov 2026. Writes site/favicon.ico (16, 32 and 48 px in one file),
# site/assets/images/favicon/icon-192.png and apple-touch-icon.png (180 px).
import os
from PIL import Image

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
source = Image.open(os.path.join(root, 'assets', 'images', 'logos', 'oad-symbol-colour-on-black-300.jpg')).convert('RGB')
out = os.path.join(root, 'assets', 'images', 'favicon')
os.makedirs(out, exist_ok=True)

def scaled(size):
    return source.resize((size, size), Image.LANCZOS)

scaled(192).save(os.path.join(out, 'icon-192.png'), optimize=True)
scaled(180).save(os.path.join(out, 'apple-touch-icon.png'), optimize=True)
scaled(48).save(os.path.join(root, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('written')
