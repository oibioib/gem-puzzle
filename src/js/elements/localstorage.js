export const prefix = 'oibioib_';

export function saveSettings(settings) {
    const data = JSON.stringify(settings);
    localStorage.setItem(`${prefix}settings`, data);
}

export function loadSettings() {
    const data = JSON.parse(localStorage.getItem(`${prefix}settings`));
    return data;
}

export function getCurrentRankingFromLs() {
    return JSON.parse(localStorage.getItem(`${prefix}ranking`));
}

export function saveCurrentRankingTooLs(ranking) {
    const data = JSON.stringify(ranking);
    localStorage.setItem(`${prefix}ranking`, data);
}
