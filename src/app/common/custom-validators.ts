import { FormControl, ValidationErrors } from "@angular/forms";

export class CustomValidators{

    // whitespace validation
    static invalidSpaceChars(control: FormControl): ValidationErrors | null {
        // check if string only contains whitespace
        //if ((control.value != null) && (control.value.trim().length === 0)) {
        
        if((control.value != null) && (control.value.toString().trim().length === 0)){
            // invalid, return error object
            return { 'invalidSpaceChars': true };
        }
        else{
            // valid, return null
            return null;
        }
    }

}