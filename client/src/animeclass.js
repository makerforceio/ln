import anime from 'animejs';

export default class AnimeClass {
  constructor() {     
    document.querySelector('#home').style.display = 'flex'
      // Wrapping letters in span
      let header = document.querySelector('#header').innerHTML
      let span_header = ''
     
    header.split('').forEach((c) => {
      c = (c === ' ') ? '&nbsp' : c
      span_header += `<span class="letter">${c}</span>`  
    })
    document.querySelector('#header').innerHTML = span_header
  }



  animate_between(id1, id2) {
    this.animate_out(id2)
    setTimeout(function() {
      this.animate_in(id1)
    }.bind(this), 1000)
  }

  animate_in(id) {
    switch(id) {
      case 'home':
        console.log('home')
        this.animate_in_home()
        break
      case 'graphview':
        console.log('graphview')
        this.animate_in_graphview()
        break
      case 'summaryview':
        this.animate_in_summaryview()
        break
      default:
        this.animate_in_home()
    }
  }

  animate_out(id) {
    switch(id) {
      case 'home':
        console.log('animate out')
        this.animate_out_home()
        break
      case 'graphview':
        this.animate_out_graphview()
        break
      case 'summaryview':
        this.animate_out_summaryview()
        break
      default:
        this.animate_out_home()
    }
  }

  animate_in_home() { 
    // Animation for header
    anime({
        targets: '#header .letter',
        scale: [0, 1],
        duration: 2000,
        elasticity: 600,
        delay: function(el, i) {
          return 45 * (i+1)
        }
    })
    
    this.create_anime_fadein('.searchbar')
    this.create_anime_fadein('.suggest')
  }

  animate_out_home() {
    this.create_anime_fadeout('#header')
    this.create_anime_fadeout('.searchbar')
    this.create_anime_fadeout('.suggest')

    setTimeout(function() {document.querySelector('#home').style.display = 'none'}, 1000)
  }

  animate_in_graphview() {
    document.querySelector('#graphview').style.display = 'flex'
    this.create_anime_fadein('.back')
    this.create_anime_fadein('#graphview h1')
    this.create_anime_fadein('#searchterm')
    this.create_anime_fadein('svg')
  }

  animate_out_graphview() {
    this.create_anime_fadeout('#graphview h1')
    this.create_anime_fadeout('#searchterm')
    this.create_anime_fadeout('svg')
    setTimeout(function() {document.querySelector('#graphview').style.display = 'none'}, 1000)
  }

  animate_in_summaryview() {
    document.querySelector('#summaryview').style.display = 'flex'
    this.create_anime_fadein('#summaryview #summarytask')
    this.create_anime_fadein('#summarytitle')
    // this.create_anime_fadein('.back')
    
    anime({
      targets: '.gridview .card',
      scale: [0, 1],
      duration: 2000,
      elasticity: 300,
      delay: function(el, i) {
        return 60 * (i+1)
      }
    })
  }
  
  animate_out_summaryview() {
    this.create_anime_fadeout('#summaryview h1')
    this.create_anime_fadeout('#summarytitle')
    // this.create_anime_fadeout('.back')
    setTimeout(function() {document.querySelector('#summaryview').style.display = 'none'}, 1000)
  }

  create_anime_fadeout(targets) {
    anime({
      targets: targets,
      translateY: [0, 50],
      opacity: [1, 0],
      duration: 1000,
      elasticity: 600
    })
  }

  create_anime_fadein(targets) {
    anime({
      targets: targets,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 2000,
      elasticity: 600
    })
  }

}

// vim: ts=2:ss=2:sw=2:et
