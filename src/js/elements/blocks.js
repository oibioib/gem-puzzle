function createBlock(parentBlock, blockClass) {
    const block = document.createElement('div');
    block.classList.add(blockClass);
    parentBlock.appendChild(block);
    return block;
}

export default createBlock;
