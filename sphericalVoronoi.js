// WIDTH must equal HEIGHT
// WIDTH and HEIGHT must be a power of 2

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const RESOLUTION = 1;
const WIDTH = canvas.width * RESOLUTION;
const HEIGHT = canvas.height * RESOLUTION;
const SEED_COLOR = 'blue'
const SEED_NUMBER = 100000;
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

var pixels = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => ({ px: null, py: null, color: null, vec: null })));
var seeds = [];
var searchRadius = WIDTH/2;

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

const mod = (n, m) => ((n % m) + m) % m;

// function toroidalDist(x, y, px, py, width) {
//     const dx = Math.abs(x - px);
//     const wrappedDx = Math.min(dx, width - dx); // horizontal wrap

//     const dy = y - py; // no vertical wrap (since you only want horizontal)

//     return wrappedDx * wrappedDx + dy * dy;
// }

function dist(a, b) {
    const dotProduct = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const clamped = Math.max(-1, Math.min(1, dotProduct));
    return Math.acos(clamped);
}


function coordsToSphereVector(y, x) {
    const epsilon = 0.001;
    const latitude = Math.max(-Math.PI/2 + epsilon, Math.min(Math.PI/2 - epsilon, 
        (y / HEIGHT) * Math.PI - Math.PI/2));
    const longitude = (x / WIDTH) * 2*Math.PI - Math.PI;

    return [ 
        Math.cos(latitude)*Math.cos(longitude),
        Math.cos(latitude)*Math.sin(longitude),
        Math.sin(latitude)
     ]
}

function sphereVectorToCoords(vector) {
    return [
        Math.atan2(vector[1],vector[0]), // lat
        Math.atan2(vector[2], Math.sqrt(vector[0]**2 + vector[1] ** 2)) // lon
    ]
}

function initializePixels(pixels, width, height) {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            pixels[y][x].vec = coordsToSphereVector(y, x);
        }
    }
}

function generateRandomSeeds(numSeeds, width, height) {
    for (var i = 0; i < numSeeds; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        
        let color;
        if (SPECTRUM_MODE === 'rainbow') {
            const hue = Math.floor((x / width) * 360);
            color = hslToHex(hue, 100, 50);
        } else {
            color = COLORS[i % COLORS.length];
        }
        
        const vec = coordsToSphereVector(y, x);
        seeds.push({ x, y, color, vec });
        pixels[y][x] = { px: x, py: y, color, vec };
    }
    return seeds;
}

function step(pixels, seeds, width, height) {
    var bufferPixels = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => ({ px: null, py: null, color: null, vec: null })));
    function voronoi() {
        for (let y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var directionsFound = [];
                for (const [dx, dy] of DIRECTIONS) {
                    const nx = mod(x + dx * searchRadius,WIDTH);
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
                        distance: dist(pixels[y][x].vec, pixels[pixels[y][x].py][pixels[y][x].px].vec),
                        color: pixels[y][x].color,
                        vec: pixels[y][x].vec
                        }
                    : { x: null, y: null, distance: Infinity, color: null, vec: null };

                for (var dir of directionsFound) {
                    const dirVec = pixels[dir[1]][dir[0]].vec;
                    var distance = dist(pixels[y][x].vec, dirVec);
                    if (distance < bestDist.distance) {
                        bestDist = {
                            x: dir[0],
                            y: dir[1],
                            distance,
                            color: dir[2],
                            vec: dirVec
                        }
                    }
                }

                bufferPixels[y][x] = {
                    px: bestDist.x,
                    py: bestDist.y,
                    color: bestDist.color,
                    vec: pixels[y][x].vec
                };
            }
        }
    }

    voronoi();

    searchRadius = searchRadius != 1 ? Math.max(1, Math.floor(searchRadius / 2)) : 1;

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

initializePixels(pixels, WIDTH, HEIGHT);
generateRandomSeeds(SEED_NUMBER, WIDTH, HEIGHT);

document.addEventListener("keydown", function (event) {
  if (event.key === "a") {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    pixels = step(pixels, seeds, WIDTH, HEIGHT);
    renderPixels(pixels, WIDTH, HEIGHT);
    // for (seed of seeds) {
    //     ctx.beginPath();
    //     ctx.fillStyle = SEED_COLOR;
    //     ctx.arc(seed.x*(1/RESOLUTION), seed.y*(1/RESOLUTION), 3, 0, 2 * Math.PI);
    //     ctx.fill();
    // }
  }
});