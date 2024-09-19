import { Component, OnInit } from '@angular/core';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-game-record-detail',
  templateUrl: './game-record-detail.component.html',
  styleUrls: ['./game-record-detail.component.css']
})
export class GameRecordDetailComponent implements OnInit{

  gameRecord: GameRecord
  index:number=1
  modo:string='Questions'

  constructor(private userService: UserService, private location:Location){
   
  }

  ngOnInit(){
    this.gameRecord=this.userService.getRecord()
  }

  cambioModo(modo:string){
    this.modo=modo;
  }


  goBack(): void {
    this.location.back();
  }

}
