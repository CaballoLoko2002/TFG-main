import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/interfaces/question';
import QuestionService from 'src/app/services/question.service';

@Component({
  selector: 'app-crearpregunta',
  templateUrl: './crearpregunta.component.html',
  styleUrls: ['./crearpregunta.component.css']
})
export class CrearpreguntaComponent {


  textoSuperior:string;
  textoBoton:string;
  editing:boolean
  form:FormGroup;
  preQuestion:Question;
  country: string;
  topic: string;
  question: string;
  answer: string;
  selectedFile: any;
  isFile:boolean =false
  imageURL:string //preview de la imagen

  information:string;
  constructor(private _formBuilder: FormBuilder, private questionS: QuestionService,private router:Router,private arouter: ActivatedRoute){

  }


  ngOnInit() {
    this.arouter.queryParams.subscribe(params => {
      if(params['objeto']){
        this.preQuestion = JSON.parse(params['objeto']);
        this.form = this._formBuilder.group({
          country: [this.preQuestion.country, Validators.required],
          topic:[this.preQuestion.topic,Validators.required],
          question:[this.preQuestion.question,Validators.required],
          answer:[this.preQuestion.answer,Validators.required],
          information:[this.preQuestion.information]

        })

        if(this.preQuestion.image!=""){
        this.imageURL=this.preQuestion.image!;
        this.isFile=true;
        this.form.get('information')?.enable()
        }
        else{
          this.form.get('information')?.disable()
        }
        this.editing=true;
        this.textoSuperior="Edit question"
        this.textoBoton="Edit"
      }
      else{
        this.form = this._formBuilder.group({
          country: ['', Validators.required],
          topic:['',Validators.required],
          question:['',Validators.required],
          answer:['',Validators.required],
          information:['']
      })
      this.form.get('information')?.disable()
      this.textoSuperior="Create a question"
      this.textoBoton="Create"
      this.editing=false;
    }});



  }


  onFileSelected(event:any):void{
    this.selectedFile = event.target.files[0] ?? null;

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile); // toBase64
    reader.onload = () => {
      this.imageURL = reader.result as string; // base64 Image src
    };
    this.isFile=true;
    this.form.get('information')?.enable()

  }

  eliminarFoto(){
    this.selectedFile=null
    this.isFile=false;
    this.form.get('information')?.enable()
  }

  submit(){
    this.country = this.form.get('country')?.value!
    this.topic=this.form.get('topic')?.value!;
    this.question=this.form.get('question')?.value!
    this.answer=this.form.get('answer')?.value!
    this.information=this.form.get('information')?.value!

    const formData= new FormData();
    formData.append("question",this.question)
    formData.append("answer",this.answer)
    formData.append("country",this.country)
    formData.append('topic',this.topic)


    if(this.selectedFile!=null){
    formData.append('files',this.selectedFile,this.selectedFile.name)
    }

    if(this.information!=''){
      formData.append("information",this.information)
    }
    if(this.country!='' && this.topic!='' && this.question!='' && this.answer!=''){
    if(!this.editing){
    this.questionS.addQuestion(formData).subscribe({
      next: () => {
        this.router.navigate(['databaseManagement'])
      },
      error: (error: any) => console.log(error),


    })
  }

  else{
    this.questionS.editQuestion(this.preQuestion._id,formData).subscribe({
      next:() =>{
        this.router.navigate(['databaseManagement'])
      },
      error: (error:any) => console.log(error)
    })

  }
}
    }



}
