// WIDTH must equal HEIGHT
// WIDTH and HEIGHT must be a power of 2

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const RESOLUTION = 1/4;
const WIDTH = canvas.width * RESOLUTION;
const HEIGHT = canvas.height * RESOLUTION;
const SEED_COLOR = 'blue'
const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1]
];
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

var pixels = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => ({ px: null, py: null, color: null })));
var seeds = [];
var searchRadius = WIDTH/2;

function generateRandomSeeds(numSeeds, width, height) {
    for (var i = 0; i < numSeeds; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        seeds.push({ x, y, color });
        pixels[y][x] = { px: x, py: y, color };
    }

    return seeds;
}

function step(pixels, seeds, width, height) {
    var bufferPixels = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => ({ px: null, py: null, color: null })));
    function voronoi() {
        for (let y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var directionsFound = [];
                for (const [dx, dy] of DIRECTIONS) {
                    const nx = x + dx * searchRadius;
                    const ny = y + dy * searchRadius;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        if (pixels[ny][nx].px != null && pixels[ny][nx].py != null) {
                            directionsFound.push([pixels[ny][nx].px, pixels[ny][nx].py, pixels[ny][nx].color]);
                        }
                    }
                }

                var bestDist = pixels[y][x].px != null
                    ? {
                        x: pixels[y][x].px,
                        y: pixels[y][x].py,
                        dist: (x - pixels[y][x].px) ** 2 + (y - pixels[y][x].py) ** 2,
                        color: pixels[y][x].color
                        }
                    : { x: null, y: null, dist: Infinity, color: null };

                for (var dir of directionsFound) {
                    var dist = ( x - dir[0] ) ** 2 + ( y- dir[1] ) ** 2
                    if (dist < bestDist.dist) {
                        bestDist = {
                            x: dir[0],
                            y: dir[1],
                            dist,
                            color: dir[2]
                        }
                    }
                }

                bufferPixels[y][x] = {
                    px: bestDist.x,
                    py: bestDist.y,
                    color: bestDist.color
                };
            }
        }
    }

    voronoi();

    searchRadius = Math.max(1, Math.floor(searchRadius / 2));

    return bufferPixels;
}

function renderPixels(pixels, width, height) {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            ctx.fillStyle = pixels[y][x].color || 'white';
            ctx.fillRect(x*(1/RESOLUTION), y*(1/RESOLUTION), 1/RESOLUTION, 1/RESOLUTION);
        }
    }
}

generateRandomSeeds(50, WIDTH, HEIGHT);

document.addEventListener("keydown", function (event) {
  if (event.key === "a") {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    pixels = step(pixels, seeds, WIDTH, HEIGHT);
    renderPixels(pixels, WIDTH, HEIGHT);
    for (seed of seeds) {
        ctx.beginPath();
        ctx.fillStyle = SEED_COLOR;
        ctx.arc(seed.x*(1/RESOLUTION), seed.y*(1/RESOLUTION), 3, 0, 2 * Math.PI);
        ctx.fill();
    }
  }
})