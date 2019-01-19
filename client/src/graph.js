import * as d3 from 'd3'

export default class Grapher {
  constructor(data) {
    this.data = data
  }

  construct_graph() {
    console.log('here')
    let svg = d3.select('svg')
    let width = +svg.attr('width')
    let height = +svg.attr('height')

    let color = d3.scaleOrdinal() // D3 Version 4
      .domain(['Black', 'White'])
      .range(['#000000', '#FFFFFF'])

    let simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.id }))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
    
    let link = svg.append('g')
        .attr('class', 'links')
      .selectAll('line')
      .data(this.data.links)
      .enter().append('line')
        .attr('stroke-width', function(d) { return Math.sqrt(d.value) })

    let node = svg.append('g')
        .attr('class', 'nodes')
      .selectAll('g')
      .data(this.data.nodes)
      .enter().append('g')

    let circles = node.append('circle')
        .attr('r', 5)
        .attr('fill', function(d) { return color('White') })
        .call(d3.drag()
            .on('start', this.dragstarted)
            .on('drag', this.dragged)
            .on('end', this.dragended))

    let lables = node.append('text')
        .text(function(d) {
          return d.id
        })
        .attr('x', 6)
        .attr('y', 3)

    node.append('title')
        .text(function(d) { return d.id })

    simulation
        .nodes(data.nodes)
        .on('tick', this.ticked)

    simulation.force('link')
        .links(data.links)
  }
 
  ticked() {
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

  dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}
