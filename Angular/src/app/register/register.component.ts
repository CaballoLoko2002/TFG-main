import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime,  fromEvent } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MailService } from '../services/mail.service';
import { HashService } from '../services/hash.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent{

  hide:boolean = true;
  name:string;
  lastname:string;
  pass:string="";
  passConfirmation:string="";
  email:string;
  isEditable:boolean=true;

  //COMPROBACION DE CORREO
  code: string;
  codeValidation:boolean=false

  //COMPROBACIONES DE CONTRASEÑA
  hasMinimumLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNonAlphaNumeric:boolean;
  hasNumber: boolean;
  isValidated: boolean;
  passEnabled:boolean;

  mailEnabled:boolean=true;
  mailWarningEnabled:boolean=false
  @ViewChild('inputRef') inputRef: ElementRef;



  firstFormGroup = this._formBuilder.group({
    email: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
  });

  thridFormGroup = this._formBuilder.group({
    password: ['', Validators.required],
    passConfirmation: ['', Validators.required],
  });


  constructor(private _formBuilder: FormBuilder, private auth: AuthService,private mailService: MailService, private hashService:HashService){}

  ngAfterViewInit() {
    fromEvent(this.inputRef.nativeElement, 'input')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.comprobarCorreo(); // aquí puedes lanzar el evento "change"
      });
  }

  submit(){
    this.name = this.secondFormGroup.get('name')?.value!
    this.lastname=this.secondFormGroup.get('surname')?.value!;
    this.email=this.firstFormGroup.get('email')?.value!
    this.pass=this.thridFormGroup.get('password')?.value!
    this.hashService.hashPassword(this.pass)
    .then(hashedPassword => {
      this.auth.register(this.email,this.name,this.lastname,hashedPassword).subscribe({
        next: () => {
          this.isEditable=false;
        },
        error: (error: any) => console.log(error)
      })
    })

  }

  validatePassword(){
    this.pass=this.thridFormGroup.get('password')?.value!
    this.passConfirmation=this.thridFormGroup.get('passConfirmation')?.value!
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

  comprobarCorreo(){
    this.email=this.firstFormGroup.get('email')?.value!

    this.auth.comprobarMail(this.email).subscribe({
      next: () => {

        this.mailEnabled=false;
        this.mailWarningEnabled=false;
      },
      error: () => {

        this.mailWarningEnabled=true
        this.mailEnabled=true;
      }
    })
  }

  enviarCodigo(){
    this.mailService.enviarCorreoCodigo(this.email).subscribe({
      error: () => {

      }
    })
  }

    // this called only if user entered full code
    onCodeCompleted(code: string) {
      this.mailService.comprobarCodigo(this.email,code).subscribe({
        next: () => {
            this.codeValidation=true;

        },
        error: () => {
          this.codeValidation=false

        }
      })
    }

  }

