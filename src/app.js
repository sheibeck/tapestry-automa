import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import * as game from './libs/game';
API.configure(awsconfig);
PubSub.configure(awsconfig);

import { listAutomaCards } from './graphql/queries'



const QueryResult = document.getElementById('QueryResult');

async function getData() {
  QueryResult.innerHTML = `QUERY RESULTS`;
  API.graphql(graphqlOperation(listAutomaCards)).then((evt) => {
    evt.data.listAutomaCards.items.map((card, i) => 
    QueryResult.innerHTML += `<p>${card.name} - ${card.description} - ${card.image}</p>`
    );
  })
}

document.getElementById('newgame').addEventListener('click', ()=>{
  $("#view-setup").removeClass("d-none");
  $("#view-cards").addClass("d-none").removeClass("d-flex");
});

document.getElementById('startgame').addEventListener('click', ()=>{
  game.startGame();
});

document.getElementById('takeincome').addEventListener('click', ()=>{
  game.takeIncome();  
});

document.getElementById('taketurn').addEventListener('click', ()=>{
  game.takeTurn();  
});
