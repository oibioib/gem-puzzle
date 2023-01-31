function Cell(x, y, size, text, bgColor, textColor) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.borderRadius = 7;
    this.text = text;
    this.bgColor = bgColor;
    this.textColor = textColor;

    this.draw = (ctx) => {
        if (this.text) {
            ctx.beginPath();
            ctx.fillStyle = this.bgColor;
            try {
                ctx.roundRect(this.x, this.y, this.size, this.size, this.borderRadius);
            } catch (err) {
                // if Firefox
                ctx.rect(this.x, this.y, this.size, this.size);
            }
            ctx.fill();
            ctx.fillStyle = this.textColor;
            ctx.font = `${this.size / 2.5}px/${this.size / 2.5}px Poppins, Arial`;
            const textWidth = ctx.measureText(this.text).width;
            const offsetX = (this.size - textWidth) / 2;
            const offsetY = (this.size / 3) * 1.85;
            ctx.fillText(this.text, this.x + offsetX, this.y + offsetY);
        }
    };
}

export default Cell;
