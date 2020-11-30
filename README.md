# average-and-dominant-color-pixel
Two workers which analyse the average and dominant color of an image with the use of a canvas.
Both workers output a Hexadecimal value to represent the color it calculates.

## Average color
This worker uses a fairly simple algorithm by counting the RGB values of each pixel and divides each value with the amount of pixels in the image. This will result in a RGB of average value.

## Dominant color
Every hexadecimal color value will counted and tracked. The color which occurs the most will be presented as the most dominant color.