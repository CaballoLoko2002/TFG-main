import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

interface Ranking {
  tabName: String; cardText: String; img: String, imgDes:String ;ranking: any[];
}

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {

  constructor(private userService:UserService){

  }
  columnsToDisplay=['No','Nombre','Score']
  topGolden: any[]
  topSilver: any[] 
  topTrophy:any[]
  topInfinite:any[]
  rankings:Ranking[]

  ngOnInit():void{
    this.userService.getTops().subscribe({
      next: (results:any) =>{
        this.rankings=[
          {tabName: "Gold Medals", cardText:"Top gold medals", img:"assets/images/goldMedal.png", imgDes: "Gold Medal Image",ranking:results.medallas},
          {tabName: "Silver Medals", cardText:"Top silver medals", img:"assets/images/silverMedal.png", imgDes: "Silver Medal Image",ranking:results.medallasPlata},
          {tabName: "Bronze Medals", cardText:"Top bronze medals", img:"assets/images/bronzeMedal.png", imgDes: "Bronze Medal Image",ranking:results.medallasBronce},
          {tabName: "Gold Trophies", cardText:"Top gold trophies", img:"assets/images/trophy.png", imgDes: "Gold Trophy Image",ranking:results.trofeos},
          {tabName: "Silver Trophies", cardText:"Top silver trophies", img:"assets/images/silverTrophy.png", imgDes: "Silver Trophy Image",ranking:results.trofeosPlata},
          {tabName: "Bronze Trophies", cardText:"Top bronze trophies", img:"assets/images/bronzeTrophy.png", imgDes: "Bronze Trophy Image",ranking:results.trofeosBronce},
          {tabName: "Infinite Score", cardText:"Top infinite score ", img:"assets/images/infinite.png", imgDes: "Infinite Score Image",ranking:results.infinites},
        ]

        this.topGolden=results.medallas
        this.topSilver=results.medallasPlata
        this.topTrophy=results.trofeos
        this.topInfinite=results.infinites
      }
    })
  }
}
