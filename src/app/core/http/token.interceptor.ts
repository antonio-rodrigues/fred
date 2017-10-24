import { CodeWithSourceMap } from 'codelyzer/angular/metadata';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = JSON.parse(sessionStorage.getItem('credentials') || localStorage.getItem('credentials')) || 'no-token';
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token)
    });
    // console.log('>> authReq >>', authReq);
    return next.handle(authReq);
  }
}
