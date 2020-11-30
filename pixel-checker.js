const root = document.documentElement;
const container = document.querySelector('#container');
const frame = document.querySelector('#frame');
const stop = document.querySelector('#stop');
const splitButton = document.querySelector('#split');
const averageButton = document.querySelector('#average');
const dominantButton = document.querySelector('#dominant');

// Setup the canvas.
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Setup workers.
const averageWorker = new Worker('./average-color-worker.js');
const dominantColorWorker = new Worker('./dominant-color-worker.js');
const workers = [averageWorker, dominantColorWorker];

// CSS Property to transition.
const property = '--color-stop';

// Width and height of image.
const width = 750;
const height = 500;

// Set canvas size.
canvas.width = width;
canvas.height = height;

/**
 * Register custom properties to allow transitions with 
 * linear-gradients when showing the colors.
 */ 
if ('registerProperty' in CSS) {
	const properties = [
		{
			name: '--color-stop',
			syntax: '<length-percentage>',
			inherits: true,
			initialValue: '50%'
		},
		{
			name: '--average-color',
			syntax: '<color>',
			inherits: true,
			initialValue: '#ffffff'
		},
		{
			name: '--dominant-color',
			syntax: '<color>',
			inherits: true,
			initialValue: '#ffffff'
		}
	];

	for (const property of properties) {
		CSS.registerProperty(property);
	}
}

/**
 * Generates a random alphanumeric string based on a given length and returns it.
 * @function	generateAlphaNumericString
 * @param 		{number} [length=10] 
 * @returns		{string}
 */
const generateAlphaNumericString = (length = 10) => {
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const setLength = charset.length;
	let value = '';
	let i = 0;
	for (i; i < length; i++) {
		value += charset.charAt(Math.floor(Math.random() * setLength));
	}
	return value;
};

/**
 * Loads an image and returns it in a Promise whenever
 * the image is finished loading.
 * @param 	{string} url The URL of the image to fetch.
 * @returns	{Promise<HTMLImageElement>}
 */
const loadImage = url => new Promise(resolve => {
	const image = new Image();
	image.crossOrigin = 'anonymous';
	image.src = url;
	image.onload = () => resolve(image);
});

/**
 * Draws an image onto the canvas.
 * @param 	{Image} image Image instance to draw.
 * @returns	{void}
 */
const drawImageOnCanvas = image => {
	context.clearRect(0, 0, width, height);
	context.drawImage(image, 0, 0, width, height);
};

/**
 * Gets the data of the current image of the canvas.
 * This returns an ImageData object with a one dimensional 
 * array of RGBA combinations.
 * @returns	{ImageData}
 */
const getImageData = () => context.getImageData(0, 0, width, height);

/**
 * Clears images if there are more than 1 in the frame.
 * @returns	{void}
 */
const clearImages = () => {
	while (frame.children.length > 1) {
		frame.firstElementChild.remove();
	}
}

/**
 * Moves the split to the center
 * @returns	{void}
 */
const splitColors = () => {
	root.style.setProperty(property, '50%');
}

/**
 * Moves the split in favor of the average color.
 * @returns	{void}
 */
const showAverage = () => {
	const value = root.style.getPropertyValue(property) !== '100%' ? 
		'100%' : 
		'50%';
	root.style.setProperty(property, value);
};

/**
 * Moves the split favor of the dominant color.
 * @returns	{void}
 */
const showDominant = () => {
	const value = root.style.getPropertyValue(property) !== '0%' ? 
		'0%' : 
		'50%';
	root.style.setProperty(property, value);
};

/**
 * Create the calculators based on the workers that are present.
 */
const workerCalculators = workers.map(worker => data => new Promise(resolve => {
	worker.postMessage(data);
	worker.addEventListener('message', ({ data: responseData }) => {
		resolve(responseData);
	}, { once: true });
}));

/**
 * Send the data of the image the worker to compute the color that is most
 * prominent in the picture. It will return the result as Hex color in a
 * Promise whenever the computation is finished.
 * 
 * The reason for this is that the calculations can be very intensive
 * and block the main thread. This way the UI won't be bothered and can
 * still run freely.
 * 
 * @param 	{Uint8ClampedArray} data Data of current image.
 * @returns	{Promise<string[]>} Array of colors. 
 */
const calculate = data => Promise.all(workerCalculators.map(calculator => calculator(data)));

/**
 * Function to run the entire process.
 * It will get a random image and load that image onto a canvas.
 * The canvas extracts the value of every individual pixel in
 * an array from which the average RGB value will be calculated.
 * 
 * Whenever the calculation is complete the image will be appended
 * to the DOM and the average color will be set as the background
 * color of the container element.
 * 
 * After that all previous images are removed from the DOM.
 * 
 * @async
 * @returns	{Promise<void>}
 */
const run = async () => {
	// Create a random seed so that every request gets a new image.
	const seed = generateAlphaNumericString(4);
	const source = `https://picsum.photos/seed/${seed}/${width}/${height}`;
	const image = await loadImage(source);
	image.addEventListener('animationend', clearImages);

	// Draw the image and get the data.
	drawImageOnCanvas(image);
	const { data } = getImageData();

	// Send the data and wait for a response.
	const [ averageColor, dominantColor ] = await Promise.all(
		workerCalculators.map(calculator => calculator(data))
	);
	
	// Add the image to the DOM
	frame.append(image);
	root.style.setProperty('--average-color', averageColor);
	root.style.setProperty('--dominant-color', dominantColor);
};

// Listen for clicks to change the background.
splitButton.addEventListener('click', splitColors);
averageButton.addEventListener('click', showAverage);
dominantButton.addEventListener('click', showDominant);

/**
 * Start an infinite interval which can be stopped by clicking
 * the stop button.
 */
let loop = setInterval(run, 10000);
run();