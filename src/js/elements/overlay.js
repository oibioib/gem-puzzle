import { renderResults } from './ranking';

const renderMessage = (data) => `Hooray! You solved the puzzle in ${data.time} and ${data.moves} moves!`;

const renderOverlay = (data, cb) => {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const overlayInner = document.createElement('div');
    overlayInner.classList.add('overlay__inner');

    if (data.type === 'message') {
        overlayInner.classList.add('overlay__inner_message');
        overlayInner.innerHTML = renderMessage(data);
    }

    if (data.type === 'ranking') {
        overlayInner.classList.add('overlay__inner_ranking');

        const [isResults, message] = renderResults();

        if (isResults) {
            overlayInner.innerHTML = `
                <p class="overlay__title">Ranking by speed</p>
                <p class="overlay__text">The best result is the one with the least time spent per move.</p>
                ${message}
            `;
        } else {
            overlayInner.innerHTML = message;
        }
    }

    overlay.addEventListener('click', (event) => {
        if (
            event.target.classList.contains('overlay') ||
            event.target.classList.contains('overlay__close')
        ) {
            overlay.remove();
            if (cb) cb();
        }
    });

    const overlayClose = document.createElement('div');
    overlayClose.classList.add('close', 'overlay__close');

    overlay.append(overlayInner, overlayClose);
    document.body.append(overlay);
};

export default renderOverlay;
