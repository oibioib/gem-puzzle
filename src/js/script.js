import '../css/main.scss';
import 'material-icons/iconfont/filled.css';
import clickAudio from '../assets/click.mp3'
import { getRandomArrayOfSizeN, isArraysIqual, loadAudio, loadFont } from './auxilary/functions';
import Cell from './elements/cell';
import createBlock from './elements/blocks';
import Moves from './elements/moves';
import Timer from './elements/timer';
import footer from './elements/footer';
import renderMenu from './elements/menu';
import renderSizes from './elements/size';
import renderOverlay from './elements/overlay';
import { isSecondVisit, loadSettings, saveFirstTimeVisit, saveSettings } from './elements/localstorage';
import { saveCurrentResult } from './elements/ranking';

const settings = {
    game: true,
    boardSize: 452,
    blocksGap: 2,
    elementsInRow: 4,
    cellBgColor: '#EA6C36',
    cellAnimateBgColor: '#BB5529',
    cellTextColor: 'white',
    animationSteps: 5,
    isPause: false,
    isSaved: false,
    isVolume: true,
    isDrag: false,
    elementDragIndex: null,
    dragOffsetX: null,
    dragOffsetY: null,
    currentCells: null,
    clickPlay: null
};

const blocks = {};
const data = {};

function createCanvas(boardSize) {
    const canvas = document.createElement('canvas');
    canvas.classList.add('game-board');
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    blocks.mainContainer.appendChild(canvas);
    settings.canvas = canvas;
    settings.ctx = ctx;

    canvas.addEventListener('pointerdown', canvasMouseDown);
    canvas.addEventListener('pointerup', canvasMouseUp);
    canvas.addEventListener('pointermove', canvasMouseMove);
}

function clearCanvas() {
    const { canvas, ctx } = settings;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function generateCellsNums() {
    settings.currentCells = getRandomArrayOfSizeN(settings.elementsInRow);
}

function calcCellSize() {
    const { boardSize, blocksGap, elementsInRow } = settings;
    settings.cellSize = (boardSize - (elementsInRow + 1) * blocksGap) / elementsInRow;
}

function createCellsToDraw() {
    const {
        blocksGap,
        elementsInRow,
        cellSize,
        currentCells,
        cellBgColor,
        cellTextColor,
    } = settings;

    const cells = [];

    for (let i = 0; i < (elementsInRow); i += 1) {
        for (let j = 0; j < elementsInRow; j += 1) {
            cells.push(
                new Cell(
                    blocksGap + j * (cellSize + blocksGap),
                    blocksGap + i * (cellSize + blocksGap),
                    cellSize,
                    currentCells[i * elementsInRow + j],
                    cellBgColor,
                    cellTextColor,
                )
            )
        }
    }

    settings.currentCellsToDraw = cells;
};

function drawCells() {
    const {
        currentCellsToDraw,
        elementDragIndex,
        cellBgColor,
        cellTextColor,
        ctx,
    } = settings;

    if (elementDragIndex === null) {
        currentCellsToDraw.forEach((cell) => {
            cell.draw(ctx, cellBgColor, cellTextColor);
        });
    } else {
        currentCellsToDraw.forEach((cell, i) => {
            if (i != elementDragIndex) {
                cell.draw(ctx, cellBgColor, cellTextColor);
            }
        });
        currentCellsToDraw[elementDragIndex].draw(ctx, cellBgColor, cellTextColor);
    }
};

function checkGameEnd() {
    const {
        elementsInRow,
        currentCells,
        game
    } = settings;

    if (game) {
        if (isArraysIqual(elementsInRow, currentCells)) {
            settings.game = false;
            data.timer.stop();
            updateMenu();
            saveCurrentResult([
                data.moves.moves,
                data.timer.timestamp,
                settings.elementsInRow
            ]);
            renderOverlay({
                type: 'message',
                time: data.timer.humanTime(),
                moves: data.moves.moves
            }, () => restartGame(settings.elementsInRow));
        }
    }
}

function defineSelectedCell(event) {
    const {
        blocksGap,
        cellSize,
        currentCells,
        elementsInRow,
    } = settings;

    const clickX = event.offsetX;
    const clickY = event.offsetY;

    const rowX = Math.floor(clickX / (cellSize + blocksGap));
    const rowY = Math.floor(clickY / (cellSize + blocksGap));
    const minX = blocksGap * (rowX + 1) + cellSize * rowX;
    const maxX = (blocksGap + cellSize) * (rowX + 1);
    const minY = blocksGap * (rowY + 1) + cellSize * rowY;
    const maxY = (blocksGap + cellSize) * (rowY + 1);

    if (
        clickX >= minX
        && clickX <= maxX
        && clickY >= minY
        && clickY <= maxY
    ) {
        const elementSelected = currentCells[rowX + rowY * elementsInRow];
        const elementSelectedIndex = currentCells.indexOf(elementSelected);
        return {
            elementSelectedIndex,
            rowX,
            rowY
        };
    }
    return {
        elementSelectedIndex: null,
    }
}

function calcClickOffsetOnElement(x, y) {
    const {
        dragOffsetX,
        dragOffsetY,
        cellSize,
        blocksGap,
        boardSize,
    } = settings;

    if (dragOffsetX === null) {
        settings.dragOffsetX = x % (cellSize + blocksGap);
    }

    if (dragOffsetY === null) {
        settings.dragOffsetY = y % (cellSize + blocksGap);
    }

    const max = boardSize - cellSize - blocksGap;
    const min = blocksGap;
    const currentX = x - settings.dragOffsetX;
    const currentY = y - settings.dragOffsetY;

    const currentXWithOffsetOnElement = currentX > max ? max : currentX < min ? min : currentX + blocksGap;
    const currentYWithOffsetOnElement = currentY > max ? max : currentY < min ? min : currentY + blocksGap;

    return [currentXWithOffsetOnElement, currentYWithOffsetOnElement];
}

function animateDrag(x, y) {
    const {
        currentCellsToDraw,
        elementDragIndex,
        cellAnimateBgColor: cellBgColorDrag,
        isDrag
    } = settings;

    if (isDrag) {
        const [xDragWithOffset, yDragWithOffset] = calcClickOffsetOnElement(x, y);

        currentCellsToDraw[elementDragIndex].x = xDragWithOffset;
        currentCellsToDraw[elementDragIndex].y = yDragWithOffset;
        currentCellsToDraw[elementDragIndex].bgColor = cellBgColorDrag;

        clearCanvas();
        drawCells();
    }
}

function animateCell({ x, y }, elementIndex, emptyIndex, steps) {
    if (steps) {
        const { currentCellsToDraw } = settings;

        if (x !== null && y !== null) {
            currentCellsToDraw[elementIndex].x = x;
            currentCellsToDraw[elementIndex].y = y;
        } else {
            const cellEmpty = currentCellsToDraw[emptyIndex];
            const cellToMove = currentCellsToDraw[elementIndex];
            let currentX = cellToMove.x;
            let currentY = cellToMove.y;

            const difX = currentX - cellEmpty.x;
            const difY = currentY - cellEmpty.y;

            const stepX = difX / steps;
            const stepY = difY / steps;

            currentCellsToDraw[elementIndex].x -= stepX;
            currentCellsToDraw[elementIndex].y -= stepY;
        }

        clearCanvas();
        drawCells();

        requestAnimationFrame(() => animateCell({ x: null, y: null }, elementIndex, emptyIndex, steps - 1));

    } else {
        const { currentCells, clickPlay, isVolume } = settings;
        [
            currentCells[elementIndex],
            currentCells[emptyIndex]
        ] = [
            currentCells[emptyIndex],
            currentCells[elementIndex]
        ];

        settings.isDrag = false;

        if (clickPlay && isVolume) {
            settings.clickPlay.play();
        }

        data.moves.increase();

        clearCanvas();
        createCellsToDraw();
        drawCells();
        checkGameEnd();
    }
}

function canvasMouseDown(event) {
    const { game, canvas, currentCells } = settings;
    if (game && event.isPrimary) {
        if (!data.timer.isRunning) resumeGame();
        const { elementSelectedIndex } = defineSelectedCell(event);
        if (elementSelectedIndex !== null && currentCells[elementSelectedIndex] !== 0) {
            settings.isDrag = true;
            settings.elementDragIndex = elementSelectedIndex;
            canvas.classList.add('drag');
        }
    }
}

function canvasMouseMove(event) {
    const { isDrag } = settings;
    if (isDrag && event.isPrimary) {
        const currentX = event.offsetX;
        const currentY = event.offsetY;
        requestAnimationFrame(() => animateDrag(currentX, currentY));
    }
}

function canvasMouseUp(event) {
    const {
        currentCells,
        currentCellsToDraw,
        elementDragIndex,
        isDrag,
        canvas,
        elementsInRow,
        animationSteps,
        cellSize,
        blocksGap,
        game
    } = settings;

    if (game && isDrag) {
        const emptyIndex = currentCells.indexOf(0);

        const emptyXRow = emptyIndex % elementsInRow;
        const emptyYRow = Math.floor(emptyIndex / elementsInRow);

        const dragXRow = elementDragIndex % elementsInRow;
        const dragYRow = Math.floor(elementDragIndex / elementsInRow);

        if (Math.abs(emptyXRow - dragXRow) + Math.abs(emptyYRow - dragYRow) === 1) {

            const { x: emptyCellX, y: emptyCellY } = currentCellsToDraw[emptyIndex];
            const { x: dragCellX, y: dragCellY } = currentCellsToDraw[elementDragIndex];

            if (
                cellSize + 2 * blocksGap
                >= Math.abs(emptyCellX - dragCellX)
                + Math.abs(emptyCellY - dragCellY)
            ) {
                const [x, y] = calcClickOffsetOnElement(event.offsetX, event.offsetY);
                requestAnimationFrame(() => animateCell({ x, y }, elementDragIndex, emptyIndex, animationSteps));
            }
        }
    }

    canvas.classList.remove('drag');
    settings.elementDragIndex = null;
    settings.dragOffsetX = null;
    settings.dragOffsetY = null;
    settings.isDrag = false;

    clearCanvas();
    createCellsToDraw();
    drawCells();
    checkGameEnd();
}

function updateSizesCb(elementsInRow) {
    blocks.sizes.replaceChildren(renderSizes(updateSizesCb, elementsInRow));
    restartGame(elementsInRow);
}

function createContentBlocks() {
    blocks.mainContainer = createBlock(document.body, 'container');
    blocks.loading = createBlock(document.body, 'loading');
    blocks.loader = createBlock(blocks.loading, 'loader');
    blocks.moves = createBlock(blocks.mainContainer, 'game-moves');
    blocks.timer = createBlock(blocks.mainContainer, 'game-timer');
    blocks.sizes = createBlock(blocks.mainContainer, 'game-sizes');
    blocks.sizes.append(renderSizes(updateSizesCb, settings.elementsInRow));
    blocks.menu = createBlock(blocks.mainContainer, 'game-menu');
    updateMenu();
    blocks.footer = createBlock(blocks.mainContainer, 'footer');
    blocks.footer.innerHTML = footer();

    blocks.menu.addEventListener('click', (event) => {
        const { target } = event;
        if (target.classList.contains('btn_new-game')) restartGame(settings.elementsInRow);
        if (target.classList.contains('control_volume')) changeVolume();
        if (target.classList.contains('control_ranking')) {
            pauseGame();
            renderOverlay({ type: 'ranking' }, () => {
                const time = data.timer.timestamp;
                data.timer = new Timer(blocks.timer, time);
                resumeGame()
            })
        };
        if (target.classList.contains('btn_savegame')) {
            settings.isSaved = true;
            saveSettings(dataToSave());
            updateMenu();
        }
        if (target.classList.contains('btn_loadgame')) loadSavedGame(settings.elementsInRow);
    })
}

function loadSavedGame() {
    const savedSettings = loadSettings();
    if (savedSettings) {
        settings.game = savedSettings.game;
        settings.boardSize = savedSettings.boardSize;
        settings.currentCells = savedSettings.currentCells;
        settings.elementsInRow = savedSettings.elementsInRow;
        blocks.sizes.replaceChildren(renderSizes(updateSizesCb, savedSettings.elementsInRow));
        if (savedSettings.isPause || !settings.game) {
            data.timer.stop();
        }
        data.moves = new Moves(blocks.moves, savedSettings ? savedSettings.moves : 0);
        data.moves.draw();
        data.timer.stop();
        data.timer = new Timer(blocks.timer, savedSettings ? savedSettings.time - 1 : 0);
        data.timer.start();
        updateMenu();
        updateBoardSize();
    }
}

function updateMenu() {
    const { isVolume, isSaved } = settings;
    blocks.menu.innerHTML = renderMenu(isVolume, isSaved);
}

function changeVolume() {
    settings.isVolume = !settings.isVolume
    updateMenu();
}

function updateBoardSize() {
    const w = document.body.offsetWidth;
    settings.boardSize = w < 540 ? w - 2 * 20 : 452;
    settings.canvas.width = settings.boardSize;
    settings.canvas.height = settings.boardSize;
    calcCellSize();
    createCellsToDraw();
    clearCanvas();
    drawCells(settings);
}

// GAME control
async function startGame() {
    const savedSettings = loadSettings();
    if (savedSettings) settings.isSaved = true;
    createContentBlocks();
    blocks.loading.classList.add('active');
    await loadFont('Poppins', 'url(./assets/poppins-regular.ttf)');
    const audio = await loadAudio(clickAudio);
    settings.clickPlay = audio;
    blocks.loading.classList.remove('active');
    data.moves = new Moves(blocks.moves);
    data.moves.draw();
    data.timer = new Timer(blocks.timer);
    data.timer.start();
    generateCellsNums();
    createCanvas(settings.boardSize);
    updateBoardSize();
    updateMenu();
};

function pauseGame() {
    settings.isPause = true;
    data.timer.stop();
    updateMenu();
}

function resumeGame() {
    settings.isPause = false;
    data.timer.start();
    updateMenu();
}

function restartGame(elementsInRow = 4) {
    data.moves.reset();
    data.timer.stop();
    data.timer = new Timer(blocks.timer);
    settings.game = true;
    settings.isPause = false;
    settings.elementsInRow = elementsInRow;
    updateMenu();
    generateCellsNums();
    calcCellSize();
    createCellsToDraw();
    clearCanvas();
    drawCells(settings);
    data.timer.start();
}

function dataToSave() {
    return {
        boardSize: settings.boardSize,
        currentCells: settings.currentCells,
        elementsInRow: settings.elementsInRow,
        isPause: settings.isPause,
        isSaved: settings.isSaved,
        isVolume: settings.isVolume,
        time: data.timer.timestamp,
        moves: data.moves.moves,
        game: settings.game
    }
}

document.addEventListener('DOMContentLoaded', startGame);
window.addEventListener('resize', updateBoardSize);
