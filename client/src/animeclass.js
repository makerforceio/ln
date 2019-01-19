export default class AnimeClass {
  constructor(anime) {
    this.anime = anime
  }

  animate_intro() {
    // Wrapping letters in span
    let header = document.querySelector('#header').innerHTML
    let span_header = ''

    header.split('').forEach((c) => {
      c = (c === ' ') ? '&nbsp' : c
      span_header += `<span class="letter">${c}</span>`  
    })

    document.querySelector('#header').innerHTML = span_header
    
    // Animation for header
    this.anime({
        targets: '#header .letter',
        scale: [0, 1],
        duration: 1500,
        elasticity: 600,
        delay: function(el, i) {
          return 45 * (i+1)
        }
    })

    this.anime({
      targets: '.searchbar',
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 600
    })
  }

}

// vim: ts=2:ss=2:sw=2:et