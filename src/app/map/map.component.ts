import { Observer } from 'rxjs/Rx';
import { Component, OnInit, ElementRef } from '@angular/core';

import { Logger } from '../core/logger.service';
import { MapService } from './map.service';
import { environment } from '../../environments/environment';
import { Themes } from '../shared/shared.constants';

// import * as d3 from 'd3';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import * as topojson from 'topojson';

const log = new Logger('MapComponent');

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  /* */
  isLoading: boolean;
  version: string = environment.version;
  mapElement: string = 'world'

  // d3 vars
  private d3: D3;
  private parentNativeElement: any;
  private d3map: Selection<any, any, any, any>;
  private svg: Selection<SVGSVGElement, any, null, undefined>;
  private group: Selection<SVGGElement, any, null, undefined>;
  private projection: any;
  private path: any;
  // d3 map data
  private countryData: any;
  private countryNames: any;
  // d3 map config
  private scale: number = 140;
  private width: number = 1250; // TODO: calc()
  private height: number = 700; // TODO: calc()
  private centered: any = null;
  private minZoom: number = 1; // default 1:1 zoom
  private maxZoom: number = 4;
  private transitionDuration: number = 500;

  constructor(
    element: ElementRef,
    d3Service: D3Service,
    private mapService: MapService
  ) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    this.isLoading = true;
    // load names
    this.mapService.getCountryNames()
    .subscribe((data: any) => {
      this.countryNames = data;
      // log.info({ _countryNames: this.countryNames })
    });
    // load topology
    this.mapService.getCountriesTopology()
      .finally(() => { this.isLoading = false; })
      .subscribe((data: any) => {
        this.countryData = data;
        // log.info({ _countryData: this.countryData })
        this.buildMap();
    });
  }

  ngOnDestroy() {
    // remove all svg refs
    if (this.svg.empty && !this.svg.empty()) {
      this.svg.selectAll('*').remove();
    }
  }

  /**
   * D3 interactive World Map
   */
  buildMap() {
    /* */
    const d3 = this.d3;

    const onMouseMove = (d: any) => {
      // TODO: add Country Info tooltips...
      // log.info('> mouse move on:', d.name)
      return true;
    }

    const onClicked = (d: any) => {
      // log.debug('> onClicked()', {d})
      var x, y, k: number;

      if (d && this.centered !== d) {
        var centroid = this.path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = this.maxZoom;
        this.centered = d;
      } else {
        x = this.width / 2;
        y = this.height / 2;
        k = this.minZoom;
        this.centered = null;
      }

      this.group.selectAll("path")
        .classed("active", this.centered && function(d: any) { return d === this.centered; });

      this.group.transition()
        .duration(this.transitionDuration)
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");

      this.svg.selectAll("text").transition()
        .duration(this.transitionDuration)
        .attr("transform", (d: any) => { return "translate(" + this.path.centroid(d) + ")scale(" + k + ")translate(" + -d.x + "," + -d.y + ")"})
        // .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -d.x + "," + -d.y + ")")
    }

    // do we have a placehlder
    if (this.parentNativeElement !== null) {
      // get root
      this.d3map = d3.select('#' + this.mapElement);

      // define map projection
      let _projectionMap = this.projection = d3
        .geoMercator()
        .scale(this.width / ( 2 * Math.PI)) // scale to fit group width
        .translate([this.width / 2, this.height / 1.45]); // ensure centered in group

      // define map path
      this.path = d3.geoPath().projection(this.projection);

      // apply zoom to countriesGroup
      const zoomed = () => {
        let t = d3.event.transform;
        this.group.attr(
          "transform",
          "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
        );
      };
      // set zoom behaviour
      var zoom = d3.zoom().on("zoom", zoomed);

      // bbox: contains the bounding box of a selected object
      const getTextBox = (selection: Selection<any, any, any, any>) => {
        selection.each(function(d: any) {
          d.bbox = this.getBBox();
        });
      }

      this.d3map.append('svg')

      this.svg = this.d3map.select<SVGSVGElement>('svg');
      this.svg
        .attr('width', this.width)
        .attr('height', this.height)
        // .style("stroke", Themes.WorldMap.color5)
        // .style("fill", Themes.WorldMap.color4)
        // .style("stroke-width", 1)
        .attr("preserveAspectRatio", "xMidYMid");

      const group = this.group = this.svg.append<SVGGElement>('g');

      // get countries topology
      // const countries = topojson.feature(this.countryData, this.countryData.objects.countries).features;
      // const land = topojson.feature(this.countryData, this.countryData.objects.land);
      const countries = topojson.feature(this.countryData, this.countryData.objects.countries).features;
      // const borders = topojson.mesh(this.countryData, this.countryData.objects.countries, (a: any, b: any) => { return a !== b; });

      // map names to countries topology
      const countryNamesParsed = d3.tsvParse(this.countryNames._body)
      countries.filter((d) => {
        return countryNamesParsed.some((n: any) => {
          if (d.id == n.id) return d.name = n.name;
        });
      }).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      log.debug({_countries: countries })

      const appendLabels = (d: any, i: number) => {
        const labels = this.svg.append("text")
          .attr("x", this.path)
          .attr("dy", 18);
        labels.append("textPath")
          .attr("stroke","silver")
          .attr("fill","silver")
          .attr("xlink:href","#path" + i)
          .text(d.count);
      }

      // add country paths
      group.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style("fill", Themes.WorldMap.color8) // function(d) { return color(namesById[d.id]); })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity", 0.8)
        .on("click", onClicked)
        .on('mousemove', onMouseMove);

        //Add circles to the svgContainer
        var circles = this.svg.selectAll("circle")
                           .data(countries)
                           .enter()
                           .append("circle");

        //Add the circle attributes
        var circleAttributes = circles
                       .attr("cx", (d: any) => { return d.cx; })
                       .attr("cy", (d: any) => { return d.cy; })
                       .attr("r", (d: any) => { return d.radius; })
                       .style("fill", (d: any) => { return d.color; });

        //Add the SVG Text Element to the svgContainer
        var text = this.svg.selectAll("text")
                        .data(countries)
                        .enter()
                        .append("text");

        //Add SVG Text Element Attributes
        var textLabels = text
                  .attr("class", "country-label")
                  // .attr("x", (d: any) => { return this.path.centroid(d)[0]; })
                  // .attr("y", (d: any) => { return this.path.centroid(d)[1]; })
                  .attr("transform", (d: any) => { return "translate(" + this.path.centroid(d) + ")"; })
                  .text((d: any)=> { return d.name; })
                  .attr("dx", (d: any) => "0.1em")
                  .attr("dy", (d: any) =>"0.15em")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", "10px")
                  .attr("fill", "red");

      // // tooltip
      // var zoneTooltip = group.append("div").attr("class", "zoneTooltip"),
      // infoLabel = group.append("div").attr("class", "infoLabel");
    }
  }
}
