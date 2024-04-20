import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType
} from '@angular/common/http';
var pendingRequests = 0;
import { Observable, tap } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private loadingServices: LoadingService) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loadingServices.showLoading();
    pendingRequests = pendingRequests + 1;

    return next.handle(request).pipe(
      tap({
        next:(event) => {
          if(event.type === HttpEventType.Response){
            this.handleHideLoading();
          }
        },
        error: (_) => {
          this.handleHideLoading();
        }

      })
    )
  }

  handleHideLoading(){
    pendingRequests = pendingRequests - 1;
    if(pendingRequests === 0){
      this.loadingServices.hideLoading();
    }
  }
}