import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,  } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { ImageService } from '../services/image.service';
import { UserService } from '../services/user.service';
import { GameRecord } from '../interfaces/gameRecord';

interface Trophy {
  title: String; content: String; img: String, number: number,
}
interface Achievement {
  title: String; content: String; img: String, condicion:boolean
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  vitrina: Trophy[] ;
  logros: Achievement[]
  user ?: User | null
  selectedFile: File;

  userActivo:Boolean;

  //Variables cambio de modo
  modo1:boolean=true
  games: GameRecord[]

constructor(private auth: AuthService, private image:ImageService,private _snackBar:MatSnackBar,private activatedRoute:ActivatedRoute, private userService: UserService, private router:Router) {
  this.activatedRoute.params.subscribe(val => {
    this.ngOnInit()
  });
}


ngOnInit(): void {
  this.auth.user.subscribe(x => this.user = x)
  this.activatedRoute.paramMap.subscribe((params:ParamMap) =>{
    if(this.user?._id!=params.get('uuid')!){
      this.user = <User>(this.activatedRoute.snapshot.data['resolvedResponse'])
      this.userActivo=false
    }
    else{
      this.userActivo=true
    }
  })

  this.games=this.user?.history!



  this.vitrina = [
    { title: 'Gold Medals', content: 'Play Single Player mode and get 10 correct answers', img: "assets/images/goldMedal.png", number: this.user?.vitrina?.medallaOro! },
    { title: 'Silver Medals', content: 'Play Single Player mode and get 9 correct answers', img: "assets/images/silverMedal.png",number: this.user?.vitrina?.medallaPlata! },
    { title: 'Bronze Medals', content: 'Play Single Player mode and get 7 correct answers', img: "assets/images/bronzeMedal.png",number: this.user?.vitrina?.medallaBronce! },
    { title: 'Infinite Record', content: 'Play infinite mode and beat yourself', img: "assets/images/infinite.png",number: this.user?.vitrina?.recordInfinito! },
    { title: 'Gold Trophies', content: 'Play Classroom Challenge and beat all your classmates ', img: "assets/images/trophy.png",number: this.user?.vitrina?.trofeoOro! },
    { title: 'Silver Trophies', content: 'Play Classroom Challenge and win second place', img:"assets/images/silverTrophy.png", number: this.user?.vitrina?.trofeoPlata!},
    { title: 'Bronze Trophies', content:' Play Classroom Challenge and finish in third place', img:"assets/images/bronzeTrophy.png",number:this.user?.vitrina?.trofeoBronce!},
    { title: 'Matches Played', content: 'Play any mode and enjoy yourself!', img: "assets/images/controller.png",number: this.user?.vitrina?.numPartidas! }
  ]


  this.logros = [
    { title: 'Invincible Classroom Champion', content: 'Win one gold trophy in a classroom competition', img: "assets/images/invincibleAchv.png",
    condicion: (this.user?.vitrina?.trofeoOro! !=0 )},
    {title: 'Silver Champion', content:'Win one silver trophy in a classroom competition',img:"assets/images/silverChampion.png",
    condicion:(this.user?.vitrina?.trofeoPlata!=0)},
    {title: 'Bronze Champion', content:'Win one bronze trophy in a classroom competition',img:"assets/images/bronzeChampion.png",
    condicion:(this.user?.vitrina?.trofeoBronce!=0)},
    { title: 'Unstoppable', content: 'Earn 15 points in a single game of Infinite Mode', img: "assets/images/unstoppable.png",
    condicion: (this.user?.vitrina?.recordInfinito! >=15 )},
    { title: 'Honor Student', content: 'Win 30 medals (gold,silver and bronze) in Single Player Mode', img: "assets/images/honourStudent.png" ,
    condicion: (this.user?.vitrina?.medallaOro! +this.user?.vitrina?.medallaPlata! +this.user?.vitrina?.medallaBronce!) >=30},
    { title: 'Gold Rush', content: 'Earn 30 gold medals in Single Player Mode', img: "assets/images/gold.png",
    condicion: (this.user?.vitrina?.medallaOro! >=30 ) },
    { title: 'US Congressional Medal of Freedom', content: 'Earn 60 gold medals and 20 points in the infinite game mode', img: "assets/images/USMedal.png",
    condicion: (this.user?.vitrina?.medallaOro! >=60 && this.user?.vitrina?.recordInfinito! >=20)},
    { title: 'Queen of the United Kingdom award', content: 'Earn 1 gold trophy, 20 points in Infinite Mode and 60 gold medalds', img:"assets/images/queen.png",
    condicion:(this.user?.vitrina?.trofeoOro!=0 && this.user?.vitrina?.recordInfinito!>=20 && this.user?.vitrina?.medallaOro!>=60)}

  ];

}

  onFileSelected(event:any):void{

    this.selectedFile = event.target.files[0] ?? null;

    const formData= new FormData();
    formData.append('files',this.selectedFile,this.selectedFile.name)
    this.image.uploadFile(formData,this.user!).subscribe({
      next: (response) => {
        this.user!.image=response.image
        this.user!.image=this.image.obtenerImagen(this.user!)
        //Actualizamos el usuario guardado en las cookies
        this.auth.updateUser(this.user!)
        this.openSnackBar("profileUpdated")
      },
      error: () => this.openSnackBar("error"),
    })
  }


  openSnackBar(type:string) {
    switch(type){
      case "error":{
    this._snackBar.open('Failed to upload profile picture', 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
    });
    break;
  }
    case "profileUpdated":{
      this._snackBar.open('Profile picture updated!', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 3000
      });
    }
  }
}

cambioModo(modo:boolean){
  this.modo1=modo
}

public enterData(gameRecord){
  this.userService.setRecord(gameRecord)
  this.router.navigateByUrl('gameRecordDetails')

}
}
