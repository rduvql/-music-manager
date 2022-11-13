
@directive({standalone: true})
export class DestroyedDirective implements onDestroy {
    destroyed$ = new Subject<void>();

    get pipe() {
        return pipe(takeuntil(this.destroyed$))
    }
    
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}


@component({
    selector: "...",
    hostDirective: [DestroyedDirective]
})
export class Comp implements oninit {

    private destroyed$ = inject(DestroyedDirective).destroyed$;
    // private destroyed$ = inject(DestroyedDirective).pipe;

    // takeuntil(destroyed$)
    // pipe()
}


// 
// 
// 
// 

import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: 'img' })
export class LazyImgDirective {
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype;

    if (supports) {
      nativeElement.setAttribute('loading', 'lazy');
    }
  }
}