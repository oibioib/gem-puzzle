import { convertTime } from '../auxilary/functions';

function Timer(block, timestamp = 0) {
    this.timestamp = timestamp;
    this.block = block;
    this.isRunning = false;

    this.humanTime = () => convertTime(this.timestamp);

    this.draw = () => {
        const content = document.createElement('div');
        content.innerHTML = `<span>${this.humanTime()}</span>`;
        this.block.replaceChildren(content);
    };

    this.increase = () => {
        if (this.isRunning) {
            this.draw();
            this.timestamp += 1;
            setTimeout(this.increase, 1000);
        }
    };

    this.start = () => {
        this.isRunning = true;
        this.increase();
    };

    this.stop = () => {
        this.isRunning = false;
        this.timestamp -= 1;
        this.draw();
    };

}

export default Timer;
