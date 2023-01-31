function Moves(block, moves = 0) {
    this.moves = moves;
    this.block = block;

    this.draw = () => {
        const content = document.createElement('div');
        content.innerHTML = `<span>Moves: </span>${this.moves}`;
        this.block.replaceChildren(content);
    };

    this.increase = () => {
        this.moves += 1;
        this.draw();
    };

    this.reset = () => {
        this.moves = 0;
        this.draw();
    };
}

export default Moves;
