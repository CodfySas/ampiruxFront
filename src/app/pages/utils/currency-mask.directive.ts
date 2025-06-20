import { Directive, HostListener, ElementRef, forwardRef, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
    selector: '[currencyMask]',
    standalone: false,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CurrencyMaskDirective),
        multi: true
    }]
})
export class CurrencyMaskDirective implements ControlValueAccessor {
    private onChange = (_: any) => { };
    private onTouched = () => { };

    constructor(private el: ElementRef<HTMLInputElement>) { }

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        const numeric = value.replace(/[^\d]/g, '');
        const num = parseInt(numeric || '0', 10);
        input.value = num.toLocaleString('es-CO');
        this.onChange(num);
    }

    writeValue(value: any): void {
        if (value == null) value = 0;
        this.el.nativeElement.value = value.toLocaleString('es-CO');
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
}


@NgModule({
    declarations: [CurrencyMaskDirective],
    exports: [CurrencyMaskDirective]
})
export class SharedModule { }