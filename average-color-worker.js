/**
 * Turns a RGB combination into a Hexadecimals value with... magic?
 * 
 * @param 	{number} r 
 * @param 	{number} g 
 * @param 	{number} b
 * @returns	{string}
 */
const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

/**
 * Counts up every R, G and B value and divides it through the 
 * total amount of colors. This will give the average RGB color.
 * 
 * @param 	{Uint8ClampedArray} data Clamped array of RGB values.
 */
const getAverageRGBColor = data => {
	let count = 0;
	const rgb = [0, 0, 0];
	for (let i = 0; i < data.length; i += 4) {
		rgb[0] += data[i];
		rgb[1] += data[i + 1];
		rgb[2] += data[i + 2];
		count++;
	}
	return rgb.map(component => Math.floor(component / count));
}

/**
 * Listen for messages from the main thread and 
 * call the functions to calculate the colors.
 * 
 * Then return the result as a message.
 */
self.addEventListener('message', ({ data }) => {

	/**
	 * Calculates the average RGB value and returns
	 * it as a hexadecimal.
	 */
	const averageColor = getAverageRGBColor(data);
	const hex = rgbToHex(...averageColor);
	
	// Send the result back.
	postMessage(hex);

});