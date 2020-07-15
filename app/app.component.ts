import { Component } from '@angular/core';

import { from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageBase64 = '';
  croppedImage: any = '';
  repo = {
    value: [ 
      { name: '100' },
      { name: '200' },
      { name: '400' },
      { name: '500' }
    ]
  };

  constructor() { }

  ngOnInit() {
    const urls = this.repo.value.map(item => this.fetchImage(item.name));
    forkJoin(urls).pipe(
      switchMap(responses => {
        return forkJoin(responses.map(response => this.getBase64(response)));
      })
    ).subscribe(
      (bases: Array<string>) => {
        bases.forEach((base, i) => this.repo.value[i]['base'] = base);
      },
      err => {
        console.log(err);
      }
    );
  }

  fetchImage(name) {
    return from(fetch(`https://picsum.photos/id/${name}/200/200`));
  }

  // Credit: https://stackoverflow.com/a/20285053/6513921
  getBase64(response) {
    return from(response.blob().then(blob => 
      new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })));
  }

  selectAsset(base: string) {
    this.imageBase64 = base;
  }

  imageCropped(image: string) {
    this.croppedImage = image;
  }

  imageLoaded() {
    // show cropper
  }

  loadImageFailed() {
    // show message
  }
}
