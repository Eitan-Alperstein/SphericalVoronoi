import { Voronoi } from "./Voronoi.js";

var voronoi = new Voronoi(document.getElementById("canvas"), 1/4, "random", undefined);

function stepAndRender() {
  voronoi.ctx.clearRect(0, 0, voronoi.WIDTH, voronoi.HEIGHT);
  voronoi.step();
  voronoi.renderPixels();
}

// Play the jump-flood passes automatically (search radius halves each pass
// until it reaches 1), with a short pause so you can watch the cells form.
function autoplay() {
  const done = voronoi.searchRadius === 1;
  stepAndRender();
  if (!done) setTimeout(autoplay, 250);
}
setTimeout(autoplay, 0);

// Press "s" to run one more pass by hand.
document.addEventListener("keydown", function(event) {
  if (event.key === "s") stepAndRender();
});
