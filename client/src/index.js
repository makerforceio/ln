import 'babel-polyfill';

import dgraph from 'dgraph-js-http';
import anime from 'animejs';
import AnimeClass from './animeclass';
import Logic from './logic';
import Grapher from './graph';

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Pew everything is loaded")
  // let animeClass = new AnimeClass(anime)
  // animeClass.animate_intro()

  grapher = new Grapher({
    "nodes": [
      {"id": "Cryptocurrency"},
      {"id": "Stuff"},
      {"id": "More Stuff"},
    ],
    "links": [
      {"source": "Cryptocurrency", "target": "Stuff", "value": "1"},
      {"source": "Cryptocurrency", "target": "More Stuff", "value": "5"},
      {"source": "More Stuff", "target": "Stuff", "value": "3"}
    ]
  })
  
  grapher.construct_graph()
})

window.Logic = Logic;

// vim: ts=2:ss=2:sw=2:et
