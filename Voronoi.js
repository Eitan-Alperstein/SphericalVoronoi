// WIDTH must equal HEIGHT
// WIDTH and HEIGHT must be a power of 2

import {
  DIRECTIONS, mod, dist, coordsToSphereVector
} from './utils.js';
import { SeedList } from './SeedList.js';

const SEED_NUMBER = 5000;

export class Voronoi {

    constructor(canvas, resolution, spectrum_mode, seeds) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.RESOLUTION = resolution;
        this.WIDTH = canvas.width * this.RESOLUTION;
        this.HEIGHT = canvas.height * this.RESOLUTION;
        this.SPECTRUM_MODE = spectrum_mode;
        this.searchRadius = this.WIDTH/2;

        // Pre-allocate pixel arrays (double buffer)
        this.pixels = new Array(this.HEIGHT);
        this.bufferPixels = new Array(this.HEIGHT);
        for (let y = 0; y < this.HEIGHT; y++) {
            this.pixels[y] = new Array(this.WIDTH);
            this.bufferPixels[y] = new Array(this.WIDTH);
            for (let x = 0; x < this.WIDTH; x++) {
                const vec = coordsToSphereVector(y, x, this.WIDTH, this.HEIGHT);
                this.pixels[y][x] = { px: null, py: null, color: null, vec };
                this.bufferPixels[y][x] = { px: null, py: null, color: null, vec };
            }
        }

        this.seedList = new SeedList(seeds || null);
        this.pixels = seeds == undefined ? this.seedList.init(this.WIDTH, this.HEIGHT, SEED_NUMBER, this.pixels, this.SPECTRUM_MODE) : this.seedList.reinit(this.pixels);
    }

    step() {
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
            let bestX = this.pixels[y][x].px;
            let bestY = this.pixels[y][x].py;
            let bestDist = bestX !== null ? dist(this.pixels[y][x].vec, this.pixels[bestY][bestX].vec) : Infinity;
            let bestColor = this.pixels[y][x].color;

            for (let d = 0; d < 8; d++) {
                const nx = mod(x + DIRECTIONS[d][0] * this.searchRadius, this.WIDTH);
                const ny = y + DIRECTIONS[d][1] * this.searchRadius;

                if (ny >= 0 && ny < this.HEIGHT) {
                const neighbor = this.pixels[ny][nx];
                if (neighbor.px !== null) {
                    const distance = dist(this.pixels[y][x].vec, this.pixels[neighbor.py][neighbor.px].vec);
                    if (distance < bestDist) {
                    bestX = neighbor.px;
                    bestY = neighbor.py;
                    bestDist = distance;
                    bestColor = neighbor.color;
                    }
                }
                }
            }

            this.bufferPixels[y][x].px = bestX;
            this.bufferPixels[y][x].py = bestY;
            this.bufferPixels[y][x].color = bestColor;
            }
        }

        // Swap buffers
        [this.pixels, this.bufferPixels] = [this.bufferPixels, this.pixels];
        
        this.searchRadius = this.searchRadius !== 1 ? Math.max(1, Math.floor(this.searchRadius / 2)) : 1;
    }

    renderPixels() {
        const invRes = 1 / this.RESOLUTION;
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                this.ctx.fillStyle = this.pixels[y][x].color || 'white';
                this.ctx.fillRect(x * invRes, y * invRes, invRes, invRes);
            }
        }
    }
}