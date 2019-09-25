import * as gamestate from "./gamestate";
import * as template from "./templates";
import * as helper from "./helper"

//dom elements
export const viewcards = document.getElementById("view-cards");
export const viewsetup = document.getElementById("view-setup");
export const resultAutoma1 = document.getElementById("automaResult1");
export const resultAutoma2 = document.getElementById("automaResult2");
export const resultShadowEmpire = document.getElementById("shadowEmpireResult");
export const incomeResult = document.getElementById("income");
export const toppleResult = document.getElementById("topple");
export const conquerTieBreakerResult = document.getElementById("conquer-tiebreaker");
export const meepleAutoma = document.getElementById("automa-meeple");
export const meepleShadowEmpire = document.getElementById("shadowempire-meeple");
export const currentCards = document.getElementById("currentcards");
export const progress = document.getElementById("progress");
export const era = document.getElementById("era");
export const discard = document.getElementById("discard");
export const btnTakeTurn = document.getElementById('taketurn');
export const btnConfirmTakeIncome = document.getElementById('takeincome');
export const btnViewDiscard = document.getElementById('viewdiscard');
export const btnGameReview = document.getElementById('gameReview');
export const automaBoard = document.getElementById('automa-board');
export const shadowBoard = document.getElementById('shadow-board');
export const btnClaimLandmark = document.getElementById('claim-landmark');

//events
document.addEventListener('click', function (event) {
	// If the event target doesn't match bail
	if (event.target.hasAttribute('data-automa-favorite')) {        
        var favorite = event.target.getAttribute("data-automa-favorite");        
        gamestate.setAutomaFavoriteTrack(favorite);
        app.gameMessage("The Automa's favorite track is now: " + favorite);
        console.log("Automa favorite track is: " + favorite);
        app.startGame();
    }

    if (event.target.hasAttribute('data-claim-landmark')) {
        var landmark = event.target.getAttribute("data-claim-landmark");        
        gamestate.claimLandMark(landmark, event.target);        
    }

    if (event.target.hasAttribute('data-new-favorite')) {
        var faction = event.target.getAttribute("data-new-favorite");        
        app.setNewFavorite(faction);        
    }

    else return;

}, false);


document.getElementById('newGameYes').addEventListener('click', ()=>{
    app.setupNewGame();
});

//when we show the landmark modal, update the internals to disable
//the buttons for any claimed landmarks
$('#modalClaimLandmark').on('show.bs.modal', function (e) {
    var modal = $(this);    
    let body = modal.find('.modal-body')
    let modalHtml = template.drawClaimLandmark();
    body.html(modalHtml);
});

//display updated favorites
$('#modalNewFavorite').on('show.bs.modal', function (e) {
    var modal = $(this);    
    let body = modal.find('.modal-body')

    var message = `<div>Are you further along the <strong>${helper.getTrackIcon(gamestate.getAutomaFavoriteTrack())} ${gamestate.getAutomaFavoriteTrack().toUpperCase()}</strong> track than the Automa is? <button class="btn btn-secondary btn-sm" type="button" data-new-favorite="automa">Yes</button></div>`;
    message += `<div class="mt-3">Are you further along the ${helper.getTrackIcon(gamestate.getShadowEmpireFavoriteTrack())} ${gamestate.getShadowEmpireFavoriteTrack().toUpperCase()} track than the Shadow Empire is? <button class="btn btn-secondary btn-sm" type="button" data-new-favorite="shadowempire">Yes</button></div>`;

    //if the shadow empire is further along than automa on the automa's favorite track
    if (gamestate.proxyShadowEmpireBoard[gamestate.getAutomaFavoriteTrack()] >  gamestate.proxyAutomaBoard[gamestate.getAutomaFavoriteTrack()]) {
        app.setNewFavorite(gamestate.enumFaction.automa);
    }

    //if the automa is further along than shadow empire on the shadow empire's favorite track
    if (gamestate.proxyAutomaBoard[gamestate.getShadowEmpireFavoriteTrack()] >  gamestate.proxyShadowEmpireBoard[gamestate.getShadowEmpireFavoriteTrack()]) {
        app.setNewFavorite(gamestate.enumFaction.shadowempire);
    }

    body.html(message);
});

$('#modalNewFavorite').on('hidden.bs.modal', function (e) {
    var msgFav = `<div class="text-center">The Automa's favorite is :</div> <div class="d-flex justify-content-center font-weight-bold mt-2">${helper.getTrackIcon(gamestate.getAutomaFavoriteTrack())} ${gamestate.getAutomaFavoriteTrack().toUpperCase()}</div>`;
    msgFav += `<div class="text-center mt-3">The Shadow Empires's favorite is :</div> <div class="d-flex justify-content-center font-weight-bold mt-2">${helper.getTrackIcon(gamestate.getShadowEmpireFavoriteTrack())} ${gamestate.getShadowEmpireFavoriteTrack().toUpperCase()}</div>`;
    app.gameMessage(msgFav);
});

document.getElementById('takeIncomeYes').addEventListener('click', ()=>{
    app.takeIncomeTurn();  
});

btnConfirmTakeIncome.addEventListener('click', ()=>{
    app.confirmTakeIncome();  
});

btnTakeTurn.addEventListener('click', ()=>{
    app.takeAutomaTurn();  
});

btnViewDiscard.addEventListener('click', ()=> {
    app.showDiscardPile();
});

btnGameReview.addEventListener('click', ()=> {
    app.showGameReview();
});

export function setElementHtml(elem, html) {
    elem.innerHTML = html;
}

export function disableElement(elem, disable) {
    elem.disabled = disable;
}

export function showElement(elem, show) {
    elem.style.display = show ? "" : "none";
}

export function setImageSrc(elem, src) {
    elem.src = src;
}
