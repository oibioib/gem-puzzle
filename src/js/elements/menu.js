function renderMenu(volume = true, isSaved = false) {
    const volumeCheck = `<span class="material-icons control control_volume">${volume ? 'volume_up' : 'volume_off'}</span>`;
    const savedCheck = `${isSaved ? '<span class="btn btn_loadgame">Load</span>' : ''}`;

    return `
        <div>
            <span class="btn btn_new-game">New game</span>
            <span class="btn btn_savegame">Save</span>
            ${savedCheck}
        </div>
        <div>
            ${volumeCheck}
            <span class="material-icons control control_ranking">leaderboard</span>
        </div>
    `;
}

export default renderMenu;
