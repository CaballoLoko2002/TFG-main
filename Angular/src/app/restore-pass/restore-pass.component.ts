import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MailService } from '../services/mail.service';
import { AuthService } from '../services/auth.service';
import { HashService } from '../services/hash.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-restore-pass',
  templateUrl: './restore-pass.component.html',
  styleUrls: ['./restore-pass.component.css']
})
export class RestorePassComponent {

  constructor(private mailService: MailService, private _formBuilder: FormBuilder,private auth: AuthService, private hashService:HashService ) {

  }

  hide:boolean = true;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  matcher = new MyErrorStateMatcher();
  checkIn: boolean = false
  modo: string = "modo1"
  codeValidation: boolean = false

  passFormGroup = this._formBuilder.group({
    password: ['', Validators.required],
    passConfirmation: ['', Validators.required],
  });

  pass:string="";
  passConfirmation:string="";
  hasMinimumLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNonAlphaNumeric:boolean;
  hasNumber: boolean;
  passEnabled:boolean;
  isValidated: boolean;




  public enviarCodigo() {
    this.checkIn = true;
    this.mailService.enviarCorreoCambioCont(this.emailFormControl.value!).subscribe({
      error: () => {

      }
    })
  }

  onCodeCompleted(code: string) {
    this.mailService.comprobarCodigo(this.emailFormControl.value!, code).subscribe({
      next: () => {
        this.codeValidation = true;

      },
      error: () => {
        this.codeValidation = false

      }
    })
  }

  activarCodigo() {
    this.modo = "modo2"
  }


  validatePassword(){
    this.pass=this.passFormGroup.get('password')?.value!
    this.passConfirmation=this.passFormGroup.get('passConfirmation')?.value!
    if(this.pass){
      this.hasMinimumLength = this.pass.length >= 8 && this.pass.length<=16;
      this.hasUpperCase = /[A-Z]/.test(this.pass);
      this.hasLowerCase= /[a-z]/.test(this.pass);
      this.hasNumber = /[0-9]/.test(this.pass);
      this.hasNonAlphaNumeric=/[\W]/.test(this.pass);
      this.isValidated= this.pass===this.passConfirmation;
    }

    //Comprobamos todas las condiciones al mismo tiempo para dar paso
    this.passEnabled= this.hasLowerCase && this.hasMinimumLength &&
    this.hasUpperCase && this.hasNumber && this.hasNonAlphaNumeric
    && this.isValidated
  }

  submit(){
    this.pass=this.passFormGroup.get('password')?.value!
    this.hashService.hashPassword(this.pass)
    .then(hashedPassword => {
      this.auth.changePass(this.emailFormControl.value!,hashedPassword).subscribe({
        next: () => {
          this.modo="modo3"
        },
        error: (error: any) => console.log(error)
      })
    })

  }






}
