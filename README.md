# HiDPI.js
An extremely lightweight progressive-enhancement HiDPI image replacement library while the rest of the world waits for SRCSET

Looks for images (IMG tags or container elements with `background-image` CSS properties) that are tagged with the `.hidpi-ready` class, and performs a quick substitution of the original (presumably low-src) image as soon as the HiDPI image is ready.

## Running the script

Other than including the HiDPI.js library (and any dependencies - jQuery and possibly zg.waypoints.js), there's nothing else to do. The code executes immediately, then polls the DOM for additional candidates, and then finally on DOMReady. Also executes on window resize.

## Examples

``` html
<style type="text/css">
  #div1 { background-image: url(images/my_low_res_image.jpg); height: 400px; }
</style>

<div id="div1" class="hidpi-ready" data-hidpi-source="images/my_hi_res_image.jpg">
  <h1>This is a heading over the background image</h1>
</div1>

<img src="images/my_other_low_res_image.jpg" class="hidpi-ready" data-hidpi-src="images/my_other_hi_res_image.jps" />

<!-- HiDPI is dependent on jQuery. Will eventually use require.js -->
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>

<!-- If we use "PRELOAD_SCHEME = "lazy" then we need to require zg.waypoints.js as well -->
<script src="js/lib/zg.waypoints.min.js"></script>

<!-- Include HiDPI. It executes at once, periodically, and a final time on DOMReady. Then on resize as well. -->
<script src="js/hidpi.js"></script>
```


## Disclaimer

This is early beta, by which I mean, it's working in production, but hasn't been properly prepared as a plugin or standalone library. Expect to have to do a little bit (hopefully not much) integration work.
