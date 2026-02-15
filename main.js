import { Voronoi } from "./Voronoi.js";

const SEED_NUMBER = 5000;

var voronoi = new Voronoi(document.getElementById("canvas"), 1/4, "random", undefined);

document.addEventListener("keydown", function(event) {
  if (event.key === "s") {
    voronoi.ctx.clearRect(0, 0, voronoi.WIDTH, voronoi.HEIGHT);
    voronoi.step();
    voronoi.renderPixels();
  }
});