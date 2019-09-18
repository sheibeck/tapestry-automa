import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);
import { listAutomaCards } from './graphql/queries';

import IconFavorite from "./assets/images/favorite.png";
import IconMilitary from "./assets/images/military.png";
import IconExploration from "./assets/images/exploration.png";
import IconScience from "./assets/images/science.png";
import IconTechnology from "./assets/images/technology.png";
import IconIncome from "./assets/images/income.png";
import IconTopple from "./assets/images/topple.png";
import IconEmpty from "./assets/images/empty.png";

//vars
const viewcards = document.getElementById("view-cards");
const viewsetup = document.getElementById("view-setup");
const resultAutoma1 = document.getElementById("automaResult1");
const resultAutoma2 = document.getElementById("automaResult2");
const resultShadowEmpire1 = document.getElementById("shadowEmpireResult1");
const resultShadowEmpire2 = document.getElementById("shadowEmpireResult2");
const incomeResult = document.getElementById("income");
const toppleResult = document.getElementById("topple");
const emptyResult = document.getElementById("empty");
const currentCards = document.getElementById("currentcards");

//get the card data from dynamodb
export let cardData = null;
async function getCardData(cardNum, position) {
    console.log("Get Card Data");
    API.graphql(graphqlOperation(listAutomaCards)).then((evt) => {
        cardData = evt.data.listAutomaCards;
    });
}
getCardData();

//events
document.getElementById('newgame').addEventListener('click', ()=>{
  confirmNewGame();
});

document.getElementById('newGameYes').addEventListener('click', ()=>{
  doConfirmNewGame();
});

document.getElementById('startgame').addEventListener('click', ()=>{
  startGame();
});

document.getElementById('takeincome').addEventListener('click', ()=>{
  confirmTakeIncome();  
});

document.getElementById('takeIncomeYes').addEventListener('click', ()=>{
  takeIncome();  
});

document.getElementById('taketurn').addEventListener('click', ()=>{
  takeTurn();  
});

//methods
let automaState = { 
    era: 0,
    deck: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    discard: [],
    hand: [],
};

let automaStateHandler = {  
    get: function(target, name) {
        return target[name];
    },  
    set: function(target, prop, value) { 
      target[prop] = value;
      switch(prop) {
            case "era":      
                document.getElementById("era").innerHTML = value;
                break;
            case "hand":
                document.getElementById("progress").innerHTML = value.length || 0;
                break;
            case "discard":
                document.getElementById("discard").innerHTML = value.length || 0;
                break;
      }
      return true;
    }
};

let proxyAutomaState = new Proxy(automaState, automaStateHandler);

function updateAutomaStateUI() {
    document.getElementById("progress").innerHTML = proxyAutomaState.hand.length;
    document.getElementById("discard").innerHTML = proxyAutomaState.discard.length;
}

function clearTurnResult() {
    resultAutoma2.innerHTML = "<div class='col text-center'>Click <strong>Take Automa Turn</strong>.</div>";
    resultShadowEmpire2.innerHTML = "<div class='col text-center'>Click <strong>Take Automa Turn</strong>.</div>";
}

function startGame() {
    //starting hand is cards 1 through 7
    proxyAutomaState.hand = [1,2,3,4,5,6,7];

    // reset & shuffle the deck
    proxyAutomaState.deck = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    shuffle(proxyAutomaState.deck);   

    // clear the discard pile
    proxyAutomaState.discard = [];

    //add one card to the automa hand to make it an even 8
    addToHand(1);    

    //shuffle the hand
    shuffle(proxyAutomaState.hand);

    //set the era
    proxyAutomaState.era = 1;

    updateAutomaStateUI();
    clearTurnResult();

    viewsetup.style.display = "none";
    viewcards.style.display = "";

    console.log("New Game");
    console.log(proxyAutomaState);    
}

// add cards to hand
function addToHand(numCards) {    
    for(var i = 0; i < numCards; i++) {
        let card = proxyAutomaState.deck.pop();
        proxyAutomaState.hand.push(card);
    };
}

/// put the discard pile back into the 
function createNewHandFromDiscard() {         
    while(proxyAutomaState.discard.length > 0) {
        let card = proxyAutomaState.discard.pop();
        proxyAutomaState.hand.push(card);
    };
}

//is it time for the automa to take an income turn?
function isIncomeTurn() {
    var takeIncome = proxyAutomaState.hand.length === 0;

    if (takeIncome) {
        gameMessage("The Automa takes an Income Action. Score the Automa and then click the <strong>Take Automa Income</strong> button to start the next era.");
    }

    return takeIncome;
}

function takeTurn() {
    if (!isIncomeTurn()) {
        
        //create a temporary hand that we can shuffle, lay down on the table, then stick them in the discard pile
        let tempHand = [];
        for(var i = 0; i < 2; i++) {
            let card = proxyAutomaState.hand.pop();
            tempHand.push(card);           
        };

        //shuffle the two drawn cards so we lay them down randomly
        shuffle(tempHand);

        //now add the cards into the dicard pile
        currentCards.innerHTML = "Show Automa Cards ";
        for(var i = 0; i < 2; i++) {
            let card = tempHand.pop();
            proxyAutomaState.discard.push(card);
            displayAutomaResult(card, i+1);
            currentCards.innerHTML += card + (i === 0 ? " and " : "");
        };

        updateAutomaStateUI();

        console.log("Take Turn");
        console.log(proxyAutomaState);    
    }
}

function confirmTakeIncome() {
    $('#modalConfirmIncome').modal("show");
}

function takeIncome() {
    //increase the automa to the next era
    proxyAutomaState.era++;

    //discard the remaining cards if any exist. The automa can sometimes
    //take an income action before its hand is fully empty
    while (proxyAutomaState.hand.length > 0) {
        let card = proxyAutomaState.hand.pop();
        proxyAutomaState.discard.push(card);
    }    

    //put the discard pile back into the hand and add 2 cards
    createNewHandFromDiscard();

    //add 2 cards to the automa deck
    addToHand(2);

    //shuffle the new deck
    shuffle(proxyAutomaState.hand);        

    updateAutomaStateUI();

    clearTurnResult();
    
    console.log("Take Income");
    console.log(proxyAutomaState);    
}

let modalMessage = $("#modalGameMessage")
function gameMessage(message) {
    $(".modal-body", modalMessage).html(message);
    modalMessage.modal('show');
}

function shuffle(array) {   
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;     
}

function confirmNewGame() {
    $('#modalConfirmNewGame').modal("show");
}

function doConfirmNewGame() {
    viewsetup.style.display = "";
    viewcards.style.display = "none";
}

async function displayAutomaResult(cardNum, position) {
    console.log("Display Automa Result");

    let card = cardData.items.find(item => {
        return item.id == cardNum;
    });

    if (position == 1) {
        resultAutoma1.innerHTML = `Furthest track with an available building`;
        resultShadowEmpire1.innerHTML = `Any track where it has not reached the end`;
    }

    if (position == 2) {
        resultAutoma2.innerHTML = "";
        let htmlOut = "";
        if (card.favorite > 0) htmlOut += `<img src="${IconFavorite}" alt="favorite" class="order-${card.favorite}" />`;
        if (card.military > 0) htmlOut += `<img src="${IconMilitary}" alt="military" class="order-${card.military}" />`;
        if (card.science > 0) htmlOut += `<img src="${IconScience}" alt="science" class="order-${card.science}" />`;
        if (card.exploration > 0) htmlOut += `<img src="${IconExploration}" alt="exploration" class="order-${card.exploration}" />`;
        if (card.technology > 0) htmlOut += `<img src="${IconTechnology}" alt="technology" class="order-${card.technology}" />`;
        resultAutoma2.innerHTML = htmlOut;
        
        resultShadowEmpire2.innerHTML = "";
        //flexbox reverse so we get the opposite order of the automa
        htmlOut = `<div class="d-flex flex-row-reverse justify-content-between">`;
        if (card.favorite > 0) htmlOut += `<img src="${IconFavorite}" alt="favorite" class="order-${card.favorite}" />`;
        if (card.military > 0) htmlOut += `<img src="${IconMilitary}" alt="military" class="order-${card.military}" />`;
        if (card.science > 0) htmlOut += `<img src="${IconScience}" alt="science" class="order-${card.science}" />`;
        if (card.exploration > 0) htmlOut += `<img src="${IconExploration}" alt="exploration" class="order-${card.exploration}" />`;
        if (card.technology > 0) htmlOut += `<img src="${IconTechnology}" alt="technology" class="order-${card.technology}" />`;
        htmlOut += `</div>`;
        resultShadowEmpire2.innerHTML = htmlOut;

        incomeResult.style.display = card.income ? "" : "none";
        toppleResult.style.display = card.topple ? "" : "none";
        emptyResult.style.display = !card.income && !card.topple ? "" : "none";
    }
}
