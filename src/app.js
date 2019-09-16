import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import * as game from './libs/game';

import { createTodo } from './graphql/mutations'

import awsconfig from './aws-exports';
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
  $('#modalNewGame').modal('show');
});

document.getElementById('startgame').addEventListener('click', ()=>{
  game.newGame();
});

document.getElementById('takeincome').addEventListener('click', ()=>{
  game.takeIncome();  
});

document.getElementById('taketurn').addEventListener('click', ()=>{
  game.takeTurn();  
});
