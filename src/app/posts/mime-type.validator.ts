import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {

    if(typeof(control.value) === 'string') {
        return of(null);  /* while editing the post if we do not update the image, that means it's just old image path which is of type string
                             if so, we do not need to check mime type so return valid here */
    }
    const file = control.value as File;
    const fileReader = new FileReader();
    const fileReaderObservable = new Observable((observer: Observer<{ [key: string]: any }>) => {
        fileReader.addEventListener('loadend', () => {
            const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
            let header = '';
            let isValid = false;
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            switch (header) {
                case "89504e47":        /* image/png */
                    isValid = true;
                    break;
                case "ffd8ffdb":
                case "ff8ffe0":
                case "ff8ffe1":
                case "ff8ffe2":         /* image/JPEG  these are different jpeg markers*/
                case "ff8ffe3":
                case "ff8ffe8":
                    isValid = true;
                    break;
                default:
                    isValid = false;
                    break;
            }
            if (isValid) {
                observer.next(null);   /* observer emits null if the value is valid */
            }
            else {
                observer.next({InvalidMimeType: true});
            }
            observer.complete();
        });
        fileReader.readAsArrayBuffer(file);
    });
    return fileReaderObservable;
}