import { COLORS, hslToHex } from './utils.js';

export class SeedList {
    constructor(seeds) {
        this.seeds = seeds == null ? [] : seeds;
    }

    init(width, height, num_seeds, pixels, spectrum_mode) {
        this.CANVAS_WIDTH = width;
        this.CANVAS_HEIGHT = height;
        this.NUM_SEEDS = num_seeds;

        for (let i = 0; i < num_seeds; i++) {
            const x = Math.floor(Math.random() * this.CANVAS_WIDTH);
            const y = Math.floor(Math.random() * this.CANVAS_HEIGHT);
            
            const color = spectrum_mode === 'rainbow' 
                ? hslToHex(Math.floor((x / this.CANVAS_WIDTH) * 360), 100, 50)
                : COLORS[i % COLORS.length];
            
            const vec = pixels[y][x].vec;
            this.seeds.push({ x, y, color, vec });
            pixels[y][x].px = x;
            pixels[y][x].py = y;
            pixels[y][x].color = color;
        }

        return pixels;
    }

    reinit(pixels) {
        for (var seed of this.seeds) {
            const x = Math.floor(Math.random() * this.CANVAS_WIDTH);
            const y = Math.floor(Math.random() * this.CANVAS_HEIGHT);

            pixels[y][x].px = seed.x;
            pixels[y][x].py = seed.y;
            pixels[y][x].color = seed.color;
        }

        return pixels;
    }
}

/* 

    const seeds = [];
    let searchRadius = this.WIDTH / 2;

    // Generate seeds
    for (let i = 0; i < SEED_NUMBER; i++) {
        const x = Math.floor(Math.random() * this.WIDTH);
        const y = Math.floor(Math.random() * this.HEIGHT);
        
        const color = this.SPECTRUM_MODE === 'rainbow' 
            ? hslToHex(Math.floor((x / this.WIDTH) * 360), 100, 50)
            : COLORS[i % COLORS.length];
        
        const vec = pixels[y][x].vec;
        seeds.push({ x, y, color, vec });
        pixels[y][x].px = x;
        pixels[y][x].py = y;
        pixels[y][x].color = color;
    }

    */