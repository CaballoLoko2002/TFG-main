import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from 'src/app/interfaces/game';
import { Question } from 'src/app/interfaces/question';
import QuestionService from 'src/app/services/question.service';

@Component({
  selector: 'app-gamedetails',
  templateUrl: './gamedetails.component.html',
  styleUrls: ['./gamedetails.component.css']
})
export class GamedetailsComponent implements OnInit {

  game:Game
  data: Question[]
  dataTable:MatTableDataSource<Question>
  displayedColumns: string[] = ['Title', 'Answer', 'Country', 'Topic', 'Image', 'Information'];

  constructor(private questionS: QuestionService,private router:Router,private arouter: ActivatedRoute){
    
  }
  ngOnInit(): void {
    this.arouter.queryParams.subscribe(params => {
      if(params['objeto']){
        this.game = JSON.parse(params['objeto']);
        
        this.questionS.getGameQuestions(this.game._id).subscribe({
          next: (response:any)=>{
            this.data=response
            this.dataTable= new MatTableDataSource(this.data)
          }
        })


      }})

  }


}
