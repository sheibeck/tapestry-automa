import * as asset from "./assets.js";
import * as gamestate from "./gamestate.js";
import * as helper from "./helper.js";

export function formatCardLogPair(leftCard, rightCard) {
    let pair = `<div class="row mt-1">`;
    pair += formatCardLogItem(rightCard, true) + formatCardLogItem(leftCard, false);
    pair += `</div>`;

    return pair;
}

export function formatCardLogItem(card, isLeftCard) {
    return `<div class="card small bg-light col-6">
        <div class="card-body">
            <h6 class="card-title d-flex justify-content-center">Card ${card.id}</h6>

            <p class="d-flex justify-content-center my-1 ${ isLeftCard ? "highlight-card-item" : ""}">Automa:&nbsp;${app.getTrackImage(card.automatrack, true)} </p>
            <div class="col-12 text-center">
                <img src="images/right-arrow.png" alt="right arrow" style="width: 50px;" />
            </div>
            <div class="d-flex justify-content-center ${ !isLeftCard ? "highlight-card-item" : ""}">
                <img src="${asset.IconFavorite}" class="mx-1 track-icon order-${card.favorite}" alt="favorite" />
                <img src="${asset.IconMilitary}" class="mx-1 track-icon order-${card.military}" alt="military" />
                <img src="${asset.IconScience}" class="mx-1 track-icon order-${card.science}" alt="science" />
                <img src="${asset.IconExploration}" class="mx-1 track-icon order-${card.exploration}" alt="exploration" />
                <img src="${asset.IconTechnology}" class="mx-1 track-icon order-${card.technology}" alt="technology" />
            </div>
            <div class="text-center">
                <img src="images/left-arrow.png" alt="left arrow" style="width: 50px;" />
            </div>
            <p class="d-flex justify-content-center my-1 ${ isLeftCard ? "highlight-card-item" : ""}">Shadow Empire:&nbsp;${app.getTrackImage(card.shadowtrack, true)}</p>
            <div class="d-flex justify-content-center mt-1">
                <img id="income" src="images/income.png" alt="income" class="mx-2 align-self-center track-icon ${ isLeftCard ? "highlight-card-item" : ""}" style="display:${card.income ? "" : "none"};" />
                <img id="conquer-tiebreaker" src="images/conquer-tiebreaker-${card.conquertiebreaker}.png" alt="conquer tie-breaker" class="mx-2 log-conquer-icon ${ !isLeftCard ? "highlight-card-item" : ""}" />
                <img id="topple" src="images/topple.png" alt="topple" class="mx-2 align-self-center track-icon ${ !isLeftCard ? "highlight-card-item" : ""}" style="display:${card.topple ? "" : "none"};" />
            </div>                    
        </div>
    </div>`;
}

export function formatBoardState(boardState, favorite) {
    return `(
        <div class="mr-2">${helper.getTrackIcon("favorite")}:<img src="images/${favorite}.png" class="track-icon" alt="favorite track" /></div>
        <div class="mx-2">${helper.getTrackIcon("military")}: ${boardState.military}</div>
        <div class="mx-2">${helper.getTrackIcon("exploration")}: ${boardState.exploration}</div>
        <div class="mx-2">${helper.getTrackIcon("science")}: ${boardState.science}</div>
        <div class="ml-2">${helper.getTrackIcon("technology")}: ${boardState.technology}</div>
    )`;
}

export function drawClaimLandmark() {
    let landmarks = gamestate.automaState.landmarks;
    let html = "";
    for(var trackName in landmarks) {
        html += `<div class="h5">${helper.getTrackIcon(trackName)} ${helper.snakeToCamel(trackName)}</div><div>`;       
        let btnColor = helper.getTrackColor(trackName);
        for (const key of Object.keys(landmarks[trackName])) {           
            html += `<button type="button" class="btn btn-${btnColor} btn-block" ${landmarks[trackName][key].claimed ? "disabled" : ""} data-claim-landmark="${trackName}|${key}">${landmarks[trackName][key].claimed ? "Un-Claim" : "Claim"} ${landmarks[trackName][key].name}</button>`;
        }
       
        html += "</div>";
    }
    return html;
}