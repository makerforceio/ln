import dgraph from 'dgraph-js-http';
import anime from 'animejs';
import AnimeClass from './animeclass';
import Logic from './logic';

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Pew everything is loaded")
  let animeClass = new AnimeClass(anime)
  animeClass.animate_intro()
})
