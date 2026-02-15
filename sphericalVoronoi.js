// WIDTH must equal HEIGHT
// WIDTH and HEIGHT must be a power of 2

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const RESOLUTION = 1/4;
const WIDTH = canvas.width * RESOLUTION;
const HEIGHT = canvas.height * RESOLUTION;
const SEED_COLOR = 'blue';
const SEED_NUMBER = 5000;
const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1]
];
const SPECTRUM_MODE = 'random'; // 'rainbow' or 'random'
const COLORS = [
  "aliceblue","antiquewhite","aqua","aquamarine","azure",
  "beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood",
  "cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan",
  "darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki",
  "darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon",
  "darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet",
  "deeppink","deepskyblue","dimgray","dimgrey","dodgerblue",
  "firebrick","floralwhite","forestgreen","fuchsia",
  "gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey",
  "honeydew","hotpink",
  "indianred","indigo","ivory",
  "khaki",
  "lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan",
  "lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon",
  "lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow",
  "lime","limegreen","linen",
  "magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple",
  "mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred",
  "midnightblue","mintcream","mistyrose","moccasin",
  "navajowhite","navy",
  "oldlace","olive","olivedrab","orange","orangered","orchid",
  "palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff",
  "peru","pink","plum","powderblue","purple",
  "rebeccapurple","red","rosybrown","royalblue",
  "saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue",
  "slateblue","slategray","slategrey","snow","springgreen","steelblue",
  "tan","teal","thistle","tomato","turquoise",
  "violet",
  "wheat","white","whitesmoke",
  "yellow","yellowgreen"
];

const mod = (n, m) => ((n % m) + m) % m;

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function dist(a, b) {
  const dotProduct = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const clamped = Math.max(-1, Math.min(1, dotProduct));
  return Math.acos(clamped);
}

function coordsToSphereVector(y, x) {
  const epsilon = 0.001;
  const latitude = Math.max(-Math.PI / 2 + epsilon, Math.min(Math.PI / 2 - epsilon, 
    (y / HEIGHT) * Math.PI - Math.PI / 2));
  const longitude = (x / WIDTH) * 2 * Math.PI - Math.PI;

  return [ 
    Math.cos(latitude) * Math.cos(longitude),
    Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude)
  ];
}

// Pre-allocate pixel arrays (double buffer)
let pixels = new Array(HEIGHT);
let bufferPixels = new Array(HEIGHT);
for (let y = 0; y < HEIGHT; y++) {
  pixels[y] = new Array(WIDTH);
  bufferPixels[y] = new Array(WIDTH);
  for (let x = 0; x < WIDTH; x++) {
    const vec = coordsToSphereVector(y, x);
    pixels[y][x] = { px: null, py: null, color: null, vec };
    bufferPixels[y][x] = { px: null, py: null, color: null, vec };
  }
}

const seeds = [];
let searchRadius = WIDTH / 2;

// Generate seeds
for (let i = 0; i < SEED_NUMBER; i++) {
  const x = Math.floor(Math.random() * WIDTH);
  const y = Math.floor(Math.random() * HEIGHT);
  
  const color = SPECTRUM_MODE === 'rainbow' 
    ? hslToHex(Math.floor((x / WIDTH) * 360), 100, 50)
    : COLORS[i % COLORS.length];
  
  const vec = pixels[y][x].vec;
  seeds.push({ x, y, color, vec });
  pixels[y][x].px = x;
  pixels[y][x].py = y;
  pixels[y][x].color = color;
}

function step() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let bestX = pixels[y][x].px;
      let bestY = pixels[y][x].py;
      let bestDist = bestX !== null ? dist(pixels[y][x].vec, pixels[bestY][bestX].vec) : Infinity;
      let bestColor = pixels[y][x].color;

      for (let d = 0; d < 8; d++) {
        const nx = mod(x + DIRECTIONS[d][0] * searchRadius, WIDTH);
        const ny = y + DIRECTIONS[d][1] * searchRadius;

        if (ny >= 0 && ny < HEIGHT) {
          const neighbor = pixels[ny][nx];
          if (neighbor.px !== null) {
            const distance = dist(pixels[y][x].vec, pixels[neighbor.py][neighbor.px].vec);
            if (distance < bestDist) {
              bestX = neighbor.px;
              bestY = neighbor.py;
              bestDist = distance;
              bestColor = neighbor.color;
            }
          }
        }
      }

      bufferPixels[y][x].px = bestX;
      bufferPixels[y][x].py = bestY;
      bufferPixels[y][x].color = bestColor;
    }
  }

  // Swap buffers
  [pixels, bufferPixels] = [bufferPixels, pixels];
  
  searchRadius = searchRadius !== 1 ? Math.max(1, Math.floor(searchRadius / 2)) : 1;
}

function renderPixels() {
  const invRes = 1 / RESOLUTION;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      ctx.fillStyle = pixels[y][x].color || 'white';
      ctx.fillRect(x * invRes, y * invRes, invRes, invRes);
    }
  }
}

document.addEventListener("keydown", function(event) {
  if (event.key === "a") {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    step();
    renderPixels();
  }
});