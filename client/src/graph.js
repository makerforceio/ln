import * as d3 from 'd3'

export default class Grapher {
  constructor(data) {
    this.data = data
  }

  construct_graph() {
    return new Promise((resolve, reject) => {
      let svg = d3.select('svg')
      let width = +svg.attr('width')
      let height = +svg.attr('height')

      let color = d3.scaleOrdinal() // D3 Version 4
        .domain(['Black', 'White'])
        .range(['#000000', '#FFFFFF'])

      let simulation = d3.forceSimulation()
          .force('link', d3.forceLink().id(function(d) { return d.id }).distance([200]))
          .force('charge', d3.forceManyBody())
          .force('center', d3.forceCenter(width / 2, height / 2))
      
      let link = svg.append('g')
          .attr('class', 'links')
        .selectAll('line')
        .data(this.data.links)
        .enter().append('line')
          .attr('stroke', function(d) {return color('White')})
          .attr('stroke-width', function(d) { return Math.sqrt(d.value) })

      let node = svg.append('g')
          .attr('class', 'nodes')
        .selectAll('g')
        .data(this.data.nodes)
        .enter().append('g')

      let circles = node.append('circle')
          .attr('r', function(d) {
            let weight = 0
            console.log(d.id)
            for (let elem in this.data.links) {
              // console.log(this.data.links[elem])
              if(this.data.links[elem].source == d.id)
                weight += 1
            }
            console.log(weight)
            return Math.max(20, weight)
          }.bind(this))
          .attr('fill', function(d) { return color('White') })
          .call(d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended)
             )
          .on('click', onclick)

      let lables = node.append('text')
          .text(function(d) {
            return d.title
          })
          .attr('text-anchor', 'middle')
          .attr('transform', 'translate(0, -30)')
          .attr('fill', function(d) {return color('White')})
          .attr('font-size', 20)
          .attr('font-family', 'Open Sans')
          .attr('font-weight', 700)
          .attr('stroke', color('Black'))

      node.append('title')
          .text(function(d) { return d.title })

      simulation
          .nodes(this.data.nodes)
          .on('tick', ticked)

      simulation.force('link')
          .links(this.data.links) 
      
      function ticked() {
        link
            .attr('x1', function(d) { return d.source.x })
            .attr('y1', function(d) { return d.source.y })
            .attr('x2', function(d) { return d.target.x })
            .attr('y2', function(d) { return d.target.y })

        node
            .attr('transform', function(d) {
              return 'translate(' + d.x + ',' + d.y + ')'
            })
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      function onclick(d) {
        resolve(d.name)
      }
    })
  }  
}

// vim: ts=2:ss=2:sw=2:et
