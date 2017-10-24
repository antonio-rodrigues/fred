import { timeout } from 'rxjs/operator/timeout';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { Observer } from 'rxjs/Rx';
import { Component, Injector, ElementRef, NgZone, OnInit } from '@angular/core';

import { Logger } from '../core/logger.service';
import { MapService } from './map.service';
import { environment } from '../../environments/environment';
import { Themes } from '../shared/shared.constants';

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
  mapAnchor: string = '#map-holder'

  // Define size of map group
  // Full world map is 2:1 ratio; using 12:5 because we will crop top and bottom of map
  private metrics = {
    w: 1250,
    h: 700,
    minZoom: 1,
    maxZoom: 4,
    scale: 140,
    duration: 500
  }
  private d3: D3;
  private parentNativeElement: any;
  private d3map: Selection<any, any, any, any>;
  private svg: Selection<SVGSVGElement, any, null, undefined>;
  private countriesGroup: Selection<SVGGElement, any, null, undefined>;
  private projection: any;
  private path: any;
  private centered: any = null;
  // d3 map data
  private year: number = new Date().getFullYear();
  private countryData: any = {};
  private countryNames: any = null;
  private countryStats: any = null;
  private topology: any = null;
  private tooltip: any = null;

  private appendCountryStats = () => {
    // map statistics to countries
    this.topology.map((d: any) => {
      if (d.name) {
        d.stats = this.countryStats.filter((c: any) => c.destination.toLowerCase() == d.name.toLowerCase());
        if (d.stats.length > 0) {
          Object.assign(d.stats, { countryId: d.id });
        }
      }
    });
  }

  private appendCountryNames = () => {
    // map names to countries topology
    this.topology.map((d: any) => {
      return this.countryNames.some((n: any) => {
        if (d.id == n.id) return d.name = n.name;
      });
    });
  }

  private getCountryNames = () => {
    return new Promise((resolve, reject) => {
      this.mapService.getCountryNames().subscribe(response => resolve(response))
    }).catch(reason => log.error(reason));
  };

  private getCountryStats = (params: any) => {
    return new Promise((resolve, reject) => {
      this.mapService.getCountryStats(params).subscribe(response => resolve(response))
    }).catch(reason => log.error(reason));
  };

  private getCountryData = () => {
    return new Promise((resolve, reject) => {
      this.mapService.getCountriesTopology().subscribe(response => resolve(response))
    }).catch(reason => log.error(reason));
  };

  constructor(
    ngZone: NgZone,
    element: ElementRef,
    d3Service: D3Service,
    private elementRef: ElementRef,
    private mapService: MapService
  ) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element //.nativeElement;
    window.onresize = (e) => {
      // log.debug('> window.onresize()');
      ngZone.run(() => {
        this.metrics.w = this.getMetrics().w;
        this.metrics.h = this.getMetrics().h;
      });
    };
  }

  ngOnInit() {
    let initialParams = {
      origin: environment.country,
      year: this.year
    }

    this.isLoading = true;
    this.loadData(initialParams);
  }

  ngAfterContentInit() {}

  ngOnDestroy() {
    // remove all svg refs
    if (this.svg.empty && !this.svg.empty()) {
      this.svg.selectAll('*').remove();
    }
  }


  loadData(params: any) {
    /* */
    console.group('LOAD_DATA');

    if (environment.fixtures) { // local files
      // load names
      this.mapService
        .getLocalCountryNames()
        .subscribe((data: any) => {
          this.countryNames = this.d3.tsvParse(data._body); // parse TSV
          log.info({ service_countryNames: this.countryNames })

          // load topology
          this.mapService
          .getLocalCountriesTopology()
          .finally(() => { this.isLoading = false; })
          .subscribe((data: any) => {
            this.countryData = data;
            log.info({ service_countryData: this.countryData })
            this.buildMap();
          });
      })
    } else {
      // chain service calls
      Promise.resolve('done')
        .then(() => this.getCountryNames().then(resp => this.countryNames = resp))
        .then((resp) => this.getCountryStats(params).then(resp => this.countryStats = resp))
        .then((resp) => this.getCountryData().then(resp => this.countryData = resp))
        .then((resp) => {
          log.debug('>>> loadData().done()', this.countryNames, this.countryStats, this.countryData);

          // transform GeoJSON to TopoJSON
          this.topology = topojson.feature(this.countryData, this.countryData.objects.countries).features;

          // add names to topology
          this.appendCountryNames();

          // add stats to topology
          this.appendCountryStats();

          // all data set
          log.debug({ topology: this.topology });

          // fire it up!
          this.setMetrics();
          this.buildMap();
          this.isLoading = false;
        })
        .catch((err) => log.error(err));
    }
    console.groupEnd();
  }

  getMetrics() {
    // log.info('> getMetrics()')
    if (this.parentNativeElement.nativeElement && this.parentNativeElement.nativeElement.offsetParent) {
      return {
        w: this.parentNativeElement.nativeElement.offsetParent.clientWidth + 64 || this.metrics.w,
        h: this.parentNativeElement.nativeElement.offsetParent.clientHeight + 64 || this.metrics.h
      };
    } else {
      return {
        w: this.metrics.w,
        h: this.metrics.h
      };
    }
  }

  setMetrics() {
    let t = setTimeout(() => {
      if (this.parentNativeElement.nativeElement && this.parentNativeElement.nativeElement.offsetParent) {
        this.metrics.w = this.parentNativeElement.nativeElement.offsetParent.clientWidth + 64 || this.metrics.w;
        this.metrics.h = this.parentNativeElement.nativeElement.offsetParent.clientHeight + 64 || this.metrics.h;
        // log.debug('> setMetrics()', { metrics: this.metrics })
      }
    }, 1500);
  }

  /**
   * D3 interactive World Map
   */
  buildMap() {
    /* */
    const d3 = this.d3;
    let topology: any[] = null;

    // exit if no placeholder
    if (this.parentNativeElement === null) return false;

    console.group('BUILD_WORLD_MAP')

    // define 'div' for tooltips
    const div = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // get root element
    this.d3map = d3.select(this.mapAnchor);

    // define map projection
    let _projectionMap = this.projection = d3.geoMercator()
      .scale(this.metrics.w / ( 2.4 * Math.PI)) // scale to fit group width
      .translate([this.metrics.w / 2, this.metrics.h / 1.45]); // ensure centered in group

    // define map path
    let path = this.path = d3.geoPath().projection(this.projection);

    // apply zoom to group
    const zoomed = () => {
      let t = d3.event.transform;
      this.countriesGroup.attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
    };
    var zoom = d3.zoom().on("zoom", zoomed);

    // bbox: contains the bounding box of a selected object
    const getTextBox = function(selection: Selection<any, any, any, any>) {
      selection.each(function(d: any) {
        d.bbox = this.getBBox();
      });
    }

    // calculates zoom/pan limits and sets zoom to default value
    const initiateZoom = () => {
      // log.debug('> initiateZoom:', this.getMetrics().h)
      // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
      const minZoom = Math.max(this.getMetrics().w / this.metrics.w, this.getMetrics().h / this.metrics.h);
      // set max zoom to a suitable factor of this value
      const maxZoom = Math.round(20 * minZoom);
      // set extent of zoom to chosen values
      // set translate extent so that panning can't cause map to move out of viewport
      zoom
        .scaleExtent([minZoom, maxZoom])
        .translateExtent([[0, 0], [this.metrics.w, this.metrics.h]]) // set extent of panning
      // update config
      this.metrics.minZoom = minZoom;
      this.metrics.maxZoom = maxZoom;
      // log.debug('ZOOM:', this.metrics, minZoom);

      // define X and Y offset for centre of map
      const midX = (this.getMetrics().w - (minZoom * this.metrics.w)) / 2;
      const midY = (this.getMetrics().h - (minZoom * this.metrics.h)) / 2;
      // change zoom transform to min zoom and centre offsets
      this.svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
    }

    // zoom to show a bounding box, with optional additional padding as percentage of box size
    const boxZoom = (box: any, centroid: any, paddingPerc: any) => {
      if (d3.event.defaultPrevented) return; // dragged, not clicked

      let minXY = box[0];
      let maxXY = box[1];
      // find size of map area defined
      let zoomWidth = Math.abs(minXY[0] - maxXY[0]);
      let zoomHeight = Math.abs(minXY[1] - maxXY[1]);
      // find midpoint of map area defined
      let zoomMidX = centroid[0];
      let zoomMidY = centroid[1];
      // increase map area to include padding
      zoomWidth = zoomWidth * (1 + paddingPerc / 100);
      zoomHeight = zoomHeight * (1 + paddingPerc / 100);
      // find scale required for area to fill svg
      let maxXscale = this.metrics.w / zoomWidth;
      let maxYscale = this.metrics.h / zoomHeight;
      let zoomScale = Math.min(maxXscale, maxYscale);
      // handle some edge cases
      // limit to max zoom (handles tiny countries)
      zoomScale = Math.min(zoomScale, this.metrics.maxZoom);
      // limit to min zoom (handles large countries and countries that span the date line)
      zoomScale = Math.max(zoomScale, this.metrics.minZoom);
      // Find screen pixel equivalent once scaled
      let offsetX = zoomScale * zoomMidX;
      let offsetY = zoomScale * zoomMidY;
      // Find offset to centre, making sure no gap at left or top of holder
      let dleft = Math.min(0, this.getMetrics().w / 2 - offsetX);
      let dtop = Math.min(0, this.getMetrics().h / 2 - offsetY);
      // Make sure no gap at bottom or right of holder
      dleft = Math.max(this.getMetrics().w - this.metrics.w * zoomScale, dleft);
      dtop = Math.max(this.getMetrics().h - this.metrics.h * zoomScale, dtop);
      // set zoom
      this.svg
        .transition()
        .duration(500)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        );
      // zoom labels
      d3.select(".countryName")
        .attr("font-size", (d) => zoomScale <= 10 ? '18px' : '10px');
    }

    const parseCountryStats = (d: any) => {
      const stats: any[] = [];
      if (d.stats && d.stats.length > 0) {
        // log.debug('>> D:', { d });
        stats.push('<div class="container">');
        stats.push('<div class="row"><div class="col tooltip-header__country">' + d.id + ' - ' + d.name.toUpperCase() + '</div></div>');
        stats.push('<div class="row"><div class="col tooltip-header__year">' + this.year + '</div></div>');
        stats.push('<div class="row"><div class="col tooltip-header__title">Origin</div><div class="col tooltip-header__title">Emissions</div><div class="col tooltip-header__title">Roo</div></div>');
        d.stats.map((s: any) => {
          stats.push(`<div class="row"><div class="col-sm no-wrap">`);
            stats.push(s.origin);
          stats.push('</div>');
          stats.push('<div class="col-sm">');
            stats.push(s.emissions);
          stats.push('</div><div class="col-sm">');
            stats.push((s.roo ? 'roo' : '--'));
          stats.push('</div></div>');
        })
        stats.push('</div>');
      }
      return stats.join('');
    }

    // tooltip with country statistics
    const showCountryStats = (d: any, show: boolean) => {
      // log.debug('> showCountryStats: ', show);
      if (show) {
        div.transition().duration(200).style("opacity", 1);
        div.html(parseCountryStats(d));
        div.style("left", (d3.event.pageX) + "px")
        div.style("top", (d3.event.pageY - 28) + "px");
      } else {
        div.style("left", -100)
        div.style("top", -100);
        div.html('');
        div.transition().duration(100).style("opacity", 0);
      }
    }

    // base SVG obj
    this.d3map.append('svg')
    this.svg = this.d3map.select<SVGSVGElement>('svg');
    this.svg
      .attr('width', this.metrics.w)
      .attr('height', this.metrics.h)
      .call(zoom);

    // countries group
    const countriesGroup = this.countriesGroup = this.svg.append<SVGGElement>('g')
      .attr("id", "map");

    // add a background rectangle
    countriesGroup
      .append("rect")
      .attr("fill", "none")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.metrics.w)
      .attr("height", this.metrics.h);

    // draw a path for each country
    let countries = countriesGroup
      .selectAll("path")
      .data(this.topology)
      .enter()
      .append("path")
      .attr("d", this.path)
      .attr("id", (d: any, i: number) => {
        return "country" + d.id;
      })
      .attr("class", "country")
      // show country stats card
      .on("mouseover", (d, i) => showCountryStats(d, true))
      .on("mouseout", (d, i) => showCountryStats(d, false))
      .on("click", function(d: any, i: number) {
        // d3.selectAll(".country").classed("country-on", false);
        // d3.select("#country" + d.id).classed("country-on", true);
        boxZoom(path.bounds(d), path.centroid(d), 40);
      });

    // let countryLabels = countriesGroup
    //   .selectAll("g")
    //   .data(topology)
    //   .enter()
    //   .append("g")
    //   .attr("class", "countryLabel")
    //   .attr("id", (d) => {
    //     return "countryLabel" + d.id;
    //   })
    //   .attr("transform", (d: any) => {
    //     return (
    //       "translate(" + this.path.centroid(d)[0] + "," + this.path.centroid(d)[1] + ")"
    //     );
    //   })
    //  .on("mouseover", (d, i) => showCountryStats(d, true))
    //  .on("mouseout", (d, i) => showCountryStats(d, false))
    //   .on("click", (d: any, i: number) => {
    //     // d3.selectAll(".country").classed("country-on", false);
    //     d3.select("#country" + d.id).classed("country-on", true);
    //     boxZoom(this.path.bounds(d), this.path.centroid(d), 40);
    //   })


    // boot!
    setTimeout(() => {
      // // (late binding) add label showing country name
      // countryLabels
      //   .append("text")
      //   .attr("class", "countryName")
      //   .style("text-anchor", "middle")
      //   .attr("dx", 0)
      //   .attr("dy", 0)
      //   .text((d: any) => d.name)
      //   .call(getTextBox);

      // // (late binding) add background rectangle, same size as the text
      // countryLabels
      //   .insert("rect", "text")
      //   .attr("class", "countryLabelBg")
      //   .attr("transform", (d: any) => {
      //     return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
      //   })
      //   .attr("width", (d: any) => d.bbox.width + 4)
      //   .attr("height", (d: any) => d.bbox.height)
      //   .call(getTextBox);
      render();
      initiateZoom();
    }, 1500)


    const render = () => {
      const newTopology = this.topology;
      // rejoin data
      countriesGroup.selectAll("path").data(newTopology);
      // remove old data
      countriesGroup.exit().remove();
      // update as needed
      d3.selectAll(".country").each( function(d: any) {
        if (d.id === 826) {
          d3.select("#country" + d.id).classed("country-on__origin", true)
        }
        if (d.stats && d.stats.length > 0) {
          d3.select("#country" + d.id).classed("country-on", true)
        }
      })
    }

    console.groupEnd();
  }
}
