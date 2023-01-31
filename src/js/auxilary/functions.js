export function arrayShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function isArraysIqual(n, arrayToCheck) {
    return arrayToCheck.join('') === [...[...Array(n ** 2)].map((_, i) => i)
        .slice(1), 0
    ].join('');
}

// Info: https://www.cs.princeton.edu/courses/archive/spring21/cos226/assignments/8puzzle/specification.php
export function isBoardSolvable(n, arr) {
    const inversions = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j += 1) {
            if (arr[i] > arr[j] && arr[j] !== 0) {
                inversions.push(`${arr[i]}-${arr[j]}`)
            }
        }
    }

    const rowWithZeroElement = Math.floor(arr.indexOf(0) / n);
    if (n % 2 === 1) return inversions.length % 2 === 0;
    if (n % 2 === 0) return (inversions.length + rowWithZeroElement) % 2 === 1;
    return false;
}

export function getRandomArrayOfSizeN(n) {
    const nums = [...Array(n ** 2)].map((_, i) => i);
    arrayShuffle(nums);
    return isBoardSolvable(n, nums) ? nums : getRandomArrayOfSizeN(n);
}

export async function loadFont(name, url) {
    try {
        const font = new FontFace(name, url);
        await font.load();
        document.fonts.add(font);
    } catch (err) {
        console.log('Error loading font');
    }
}

export function loadAudio(audioSrc) {
    return new Promise((resolve) => {
        const audio = new Audio(audioSrc);
        audio.addEventListener('canplaythrough', () => resolve(audio));
        audio.addEventListener('error', () => resolve(null));
    })
}

export function convertTime(timeInSeconds) {
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = timeInSeconds % 60;

    const time = [m, s];
    if (h) time.unshift(h);
    return time.map((part) => part.toString().padStart(2, '0')).join(':');
};
