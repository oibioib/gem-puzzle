function renderSizes(clickCb, currentActive = 4) {
    const allSizes = [3, 4, 5, 6, 7, 8];
    const activeSize = allSizes.includes(currentActive) ? currentActive : 4;
    const dataAttr = 'data-size';

    const sizesBlock = document.createElement('div');
    sizesBlock.classList.add('sizes');

    allSizes.forEach((size) => {
        const sizeBlock = document.createElement('span');
        sizeBlock.classList.add('sizes__btn', 'btn');
        if (size === activeSize) {
            sizeBlock.classList.add('selected');
        }
        sizeBlock.innerHTML = `${size} x ${size}`;
        sizeBlock.setAttribute(dataAttr, size);
        sizesBlock.append(sizeBlock);
    });

    const sizesClick = (event) => {
        const { target } = event;

        if (target.classList.contains('sizes__btn')) {
            const dataSizeSelected = +target.getAttribute(dataAttr);
            if (activeSize !== dataSizeSelected) clickCb(dataSizeSelected);
        }
    };

    sizesBlock.addEventListener('click', sizesClick);

    return sizesBlock;
}
export default renderSizes;
