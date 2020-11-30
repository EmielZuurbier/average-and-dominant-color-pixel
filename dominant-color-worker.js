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
 * Takes every pixel and turns the RGB values into Hexadecimals.
 * Returns a new array of Hexadecimal values.
 * 
 * @param 	{Uint8ClampedArray} data Data array of image.
 * @returns	{string[]}
 */
const convertColorsToHex = data => {
	let colors = [];
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const hex = rgbToHex(r, g, b);
		colors.push(hex);
	}
	return colors;
}

/**
 * Takes an array of strings and creates an object with keys
 * based on the strings. Then increments the value of a key if
 * the string is already present and thus counting each string.
 * 
 * @param 	{string[]} colors 
 * @returns	{object}
 */
const countColors = colors => colors.reduce((acc, cur) => {
	acc[cur] = (acc[cur] || 0) + 1;
	return acc;
}, {});

/**
 * Takes the object of counts and returns the key with the highest
 * number by comparing each key.
 * 
 * @param 	{object} counts
 * @returns	{string}
 */
const getDominantColor = counts => 
	Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

/**
 * Listen for messages from the main thread and 
 * call the functions to calculate the colors.
 * 
 * Then return the result as a message.
 */
self.addEventListener('message', ({ data }) => {

	/**
	 * The first attempt was to convert all the colors to hexadecimals
	 * and count the amount of hex values present in the array.
	 * The value with the highest score would be seen as the dominant color.
	 */
	const colors = convertColorsToHex(data);
	const count = countColors(colors);
	const highest = getDominantColor(count);
	postMessage(highest);
});