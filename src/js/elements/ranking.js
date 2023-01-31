import { convertTime } from '../auxilary/functions';
import { getCurrentRankingFromLs, saveCurrentRankingTooLs } from './localstorage';

export function saveCurrentResult(data) {
    const result = [data];
    const currentBestResult = getCurrentRankingFromLs();
    if (currentBestResult && currentBestResult.length) result.push(...currentBestResult);

    result.sort((a, b) => {
        const [movesA, timeA] = a;
        const [movesB, timeB] = b;
        return timeA / movesA - timeB / movesB;
    });

    saveCurrentRankingTooLs(result.slice(0, 10));
}

export function renderResults() {
    const currentBestResult = getCurrentRankingFromLs();
    if (!currentBestResult || !currentBestResult.length) {
        return [false, 'There are no results yet. You will be the first.'];
    }
    const table = [];
    table.push('<table>');
    table.push('<thead>');
    table.push(`
        <tr>
            <th></th>
            <th>Time per move</th>
            <th>Moves</th>
            <th>Time</th>
            <th>Board size</th>
        </tr>
    `);
    table.push('</thead>');
    table.push('<tbody>');
    currentBestResult.forEach((result, i) => {
        const [moves, time, size] = result;
        table.push(`
            <tr>
                <td>${i + 1}</td>
                <td>${(time / moves).toFixed(3)}s</td>
                <td>${moves}</td>
                <td>${convertTime(time)}</td>
                <td>${size} x ${size}</td>
            </tr>
        `);
    });
    table.push('</tbody>');
    table.push('</table>');

    return [true, table.join('')];
}
