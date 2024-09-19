import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Temas } from 'src/app/interfaces/temas';
import QuestionService from 'src/app/services/question.service';

@Component({
  selector: 'app-topicmng',
  templateUrl: './topicmng.component.html',
  styleUrls: ['./topicmng.component.css']
})
export class TopicmngComponent implements OnInit {

  temas_response:Temas;
  UK:any;
  USA:any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';




  constructor(private questionS: QuestionService,private _snackBar:MatSnackBar){

  }
  ngOnInit(): void {
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

  onToggleChange(checked:boolean,topic:string,country:string){

    if(country=='UK'){
      this.temas_response.UK[topic]=checked;
    }
    else{
      this.temas_response.USA[topic]=checked;
    }


  }

  submit(){
    this.questionS.updateTemas(this.temas_response).subscribe({
      next: () => {
        this.openSnackBar("topicsUpdated")
      },
      error:()=>{
        this.openSnackBar("error")
      }

    }


    )
  }

  openSnackBar(type:string) {
    switch(type){
      case "error":{
    this._snackBar.open('Failed to update the topics', 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
    });
    break;
  }
    case "topicsUpdated":{
      this._snackBar.open('Topics updated!', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 3000
      });
    }
  }
}
}
