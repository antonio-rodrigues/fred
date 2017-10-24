// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/mergeMap';

// import { Logger } from './core/logger.service';
// import { environment } from '../environments/environment';

// import { Injectable } from '@angular/core';
// import { Http, Response } from '@angular/http';
// import { Observable } from 'rxjs/Observable';

// const log = new Logger('AppService');

// export interface Airline {
//   name: string
// }
// export interface Aircraft {
//   model: string
// }
// export interface Country {
//   id: number,
//   name: string
// }
// export interface MapData {
//   destination: string,
//   emissions: number,
//   id: number,
//   operator: string,
//   origin: string,
//   roo: boolean,
//   year: number
// }

// @Injectable()
// export class AppService {

//   constructor(private http: Http) { }

//   private fetchData = (uri: string, cache: boolean = true): Observable<any> => {
//     return this.http.request(uri, { cache })
//       .map((res: Response) => res.json())
//       .map((body) => body)
//   }

//   getAirlines (): Observable<Airline> {
//     // return this.http.request('/airlines', { cache: true })
//     //   .map((res: Response) => res.json())
//     //   .map((body) => body)
//     //   .catch(() => Observable.of('Error, could not load airlines data!'));
//     return (
//       this.fetchData('/airlines')
//           .catch(() => Observable.of('Error, could not load airlines data!'))
//     );
//   }

// }
