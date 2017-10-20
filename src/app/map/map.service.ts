import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { Logger } from '../core/logger.service';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

const log = new Logger('MapService');

const routes = {
  geoData: (data: MapDataType) => {
    return data.source === 'names' ? '../assets/geo/world-110m-country-names.tsv' : '../assets/geo/world-110m.json'
  }
}

export interface MapDataType {
  source: string
}

@Injectable()
export class MapService {

  constructor(private http: Http) { }

  geGeoData(parm: MapDataType): Observable<any> {
    return (parm.source === 'names' ? this.getCountryNames() : this.getCountriesTopology() )
  }

  getCountriesTopology (): Observable<any> {
    return this.http.request(routes.geoData({source: 'geo'}), { cache: true })
      .map((res: Response) => res.json())
      .map((body) => body)
      .catch(() => Observable.of('Error, could not load topology data!'));
  }

  getCountryNames (): Observable<any> {
    return this.http.request(routes.geoData({source: 'names'}), { cache: true })
      .map((res: Response) => res)
      .map((body) => body)
      .catch((err: any) => Observable.of('Error, could not load names data!', err));
  }
}
