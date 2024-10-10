import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, catchError, throwError } from "rxjs";
import { ErrorComponent } from "./error/error.component";

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {

    constructor(public dialog: MatDialog) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(    /* handle() gives back response observable stream, and we hook into it to listen to events */
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An unknown error occured!';
                if(error.error.message) {
                    errorMessage = error.error.message;
                }
                this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
                return throwError(()=> error)
            })
        );   
    }
}