import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Temas } from 'src/app/interfaces/temas';
import QuestionService from 'src/app/services/question.service';

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrls: ['./game-settings.component.css']
})
export class GameSettingsComponent implements OnInit {

  temas_response:Temas;
  UK:any;
  USA:any;

  form:FormGroup;
  pais_selected:String
  topic_selected:String;


  constructor(private questionS: QuestionService,private _formBuilder: FormBuilder,private router: Router){

  }



  ngOnInit(): void {

    this.form = this._formBuilder.group({
      country: ["UK", Validators.required],
      topic:["",Validators.required],
    })


    this.questionS.getTemas().subscribe({
      next: (results:Temas)=>{
        this.temas_response=results;
        this.UK=[
          {title:"Geography", value:this.temas_response.UK['Geography']},
          {title:"History", value:this.temas_response.UK['History']},
          {title:"Society", value:this.temas_response.UK['Society']},
          {title:"General Knowledge", value:this.temas_response.UK['General Knowledge']},
          {title:"Mix", value:this.temas_response.UK['Mix']},
        ]

        this.USA=[
          {title:"Geography", value:this.temas_response.USA['Geography']},
          {title:"History", value:this.temas_response.USA['History']},
          {title:"Society", value:this.temas_response.USA['Society']},
          {title:"General Knowledge", value:this.temas_response.USA['General Knowledge']},
          {title:"Mix", value:this.temas_response.USA['Mix']},
        ]
        
      }
    })

  }

  submit(){
    this.pais_selected = this.form.get('country')?.value!
    this.topic_selected=this.form.get('topic')?.value!;


    this.router.navigate(['/games/singleplayer'], {queryParams:{pais: this.pais_selected,categoria:this.topic_selected}});
  }
  }



  

