import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/mergeMap';

import { Logger } from '../core/logger.service';
// import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { Http, Request, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

const log = new Logger('MapService');

@Injectable()
export class MapService {

  constructor(private http: Http) { }

  // local files
  getLocalCountriesTopology(): Observable<any> {
    return this.http.get('/', { cache: false, url: '../assets/geo/world-110m.json'} )
      .map((res: Response) => res.json())
      .map((body) => body)
      .catch((reason: any) => Observable.of('Error, could not load topology data!' + reason));
  }
  getLocalCountryNames(): Observable<any> {
    return this.http.get('/', { cache: false, url: '../assets/geo/world-110m-country-names.tsv'} )
      .map((res: Response) => res)
      .map((body: any) => body)
      .catch((reason: any) => Observable.of('Error, could not load country names data!' + reason));
  }

  // remote API
  getCountriesTopology(): Observable<any> {
    return this.http.get('/countriesTopology', { cache: true } )
      .map((res: Response) => res.json())
      .map((body) => body)
      .catch((reason: any) => Observable.of('Error, could not load topology data!' + reason));
  }
  getCountryNames(): Observable<any> {
    return this.http.get('/countries', { cache: false })
      .map((res: Response) => res.json())
      .map((body: any) => body)
      .catch((reason: any) => Observable.of('Error, could not load country names data!' + reason));
  }
  getCountryStats(parms: any): Observable<any> {
    const uri = `/countryMapData?origin=${parms.origin}&year=${parms.year}`;
    return this.http.get(uri, { cache: false })
      .map((res: Response) => res.json())
      .map((body: any) => body)
      .catch((reason: any) => Observable.of('Error, could not load country names data!' + reason));
  }
}
