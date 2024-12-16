import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';
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
  title: String; content: String; img: String, condicion: boolean, group: string
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  vitrina: Trophy[];
  logros: Achievement[]
  user?: User | null
  selectedFile: File;

  userActivo: Boolean;

  //Variables cambio de modo
  modo1: boolean = true
  games: GameRecord[]

  constructor(private auth: AuthService, private image: ImageService, private _snackBar: MatSnackBar, private activatedRoute: ActivatedRoute, private userService: UserService, private router: Router) {
    this.activatedRoute.params.subscribe(val => {
      this.ngOnInit()
    });
  }


  ngOnInit(): void {
    this.auth.user.subscribe(x => this.user = x)
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      if (this.user?._id != params.get('uuid')!) {
        this.user = <User>(this.activatedRoute.snapshot.data['resolvedResponse'])
        this.userActivo = false
      }
      else {
        this.userActivo = true
      }
    })

    this.games = this.user?.history!



    this.vitrina = [
      { title: 'Gold Medals', content: 'Play Single Player mode and get 10 correct answers', img: "assets/images/goldMedal.png", number: this.user?.vitrina?.medallaOro! },
      { title: 'Silver Medals', content: 'Play Single Player mode and get 9 correct answers', img: "assets/images/silverMedal.png", number: this.user?.vitrina?.medallaPlata! },
      { title: 'Bronze Medals', content: 'Play Single Player mode and get 7 correct answers', img: "assets/images/bronzeMedal.png", number: this.user?.vitrina?.medallaBronce! },
      { title: 'Infinite Record', content: 'Play infinite mode and beat yourself', img: "assets/images/infinite.png", number: this.user?.vitrina?.recordInfinito! },
      { title: 'Gold Trophies', content: 'Play Classroom Challenge and beat all your classmates ', img: "assets/images/trophy.png", number: this.user?.vitrina?.trofeoOro! },
      { title: 'Silver Trophies', content: 'Play Classroom Challenge and win second place', img: "assets/images/silverTrophy.png", number: this.user?.vitrina?.trofeoPlata! },
      { title: 'Bronze Trophies', content: ' Play Classroom Challenge and finish in third place', img: "assets/images/bronzeTrophy.png", number: this.user?.vitrina?.trofeoBronce! },
      { title: 'Matches Played', content: 'Play any mode and enjoy yourself!', img: "assets/images/controller.png", number: this.user?.vitrina?.numPartidas! }
    ]


    this.logros = [
      {
        title: 'Faculty of Magical Humanities: Accepted for Admission', content: 'Earn 10 gold medals', img: "assets/images/goldfaculty.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 10), group: 'goldMedals'
      },
      {
        title: 'Golden Broomstick', content: 'Earn 20 gold medals', img: "assets/images/goldbroom.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 20), group: 'goldMedals'
      },
      {
        title: 'Golden Magic Pen', content: 'Earn 30 gold medals', img: "assets/images/goldpen.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 30), group: 'goldMedals'
      },
      {
        title: 'Golden Magic Potion', content: 'Earn 40 gold medals', img: "assets/images/goldpotion.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 40), group: 'goldMedals'
      },
      {
        title: 'Golden Magic Sword', content: 'Earn 50 gold medals', img: "assets/images/goldsword.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 50), group: 'goldMedals'
      },
      {
        title: 'Golden Magic Wand', content: 'Earn 60 gold medals', img: "assets/images/goldmagicwand.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 60), group: 'goldMedals'
      },
      {
        title: 'Golden Magical Wisdom', content: 'Earn 70 gold medals', img: "assets/images/goldwisdom.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 70), group: 'goldMedals'
      },
      {
        title: 'Golden Rays of Knowledge', content: 'Earn 80 gold medals', img: "assets/images/goldrays.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 80), group: 'goldMedals'
      },
      {
        title: 'Golden Quill', content: 'Earn 90 gold medals', img: "assets/images/goldquill.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 90), group: 'goldMedals'
      },
      {
        title: 'Gold Ring of Knowledge', content: 'Earn 100 gold medals', img: "assets/images/goldring.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 100), group: 'goldMedals'
      },
      {
        title: 'Golden Crystal Ball', content: 'Earn 120 gold medals', img: "assets/images/goldenball.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 120), group: 'goldMedals'
      },
      {
        title: 'English Studies Gold Badge of Merit', content: 'Earn 150 gold medals', img: "assets/images/goldbadge.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 150), group: 'goldMedals'
      },
      {
        title: 'Faculty of Magical Humanities: Accepted for Admission',
        content: 'Earn 10 silver medals',
        img: "assets/images/silverfaculty.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 10), group: 'silverMedals'
      },
      {
        title: 'Silver Broomstick',
        content: 'Earn 20 silver medals',
        img: "assets/images/silverbroom.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 20), group: 'silverMedals'
      },
      {
        title: 'Silver Magic Pen',
        content: 'Earn 30 silver medals',
        img: "assets/images/silverpen.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 30), group: 'silverMedals'
      },
      {
        title: 'Silver Magic Potion',
        content: 'Earn 40 silver medals',
        img: "assets/images/silverpotion.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 40), group: 'silverMedals'
      },
      {
        title: 'Silver Magic Sword',
        content: 'Earn 50 silver medals',
        img: "assets/images/silversword.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 50), group: 'silverMedals'
      },
      {
        title: 'Silver Magic Wand',
        content: 'Earn 60 silver medals',
        img: "assets/images/silvermagicwand.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 60), group: 'silverMedals'
      },
      {
        title: 'Silver Magical Wisdom',
        content: 'Earn 70 silver medals',
        img: "assets/images/silverwisdom.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 70), group: 'silverMedals'
      },
      {
        title: 'Silver Rays of Knowledge',
        content: 'Earn 80 silver medals',
        img: "assets/images/silverrays.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 80), group: 'silverMedals'
      },
      {
        title: 'Silver Quill',
        content: 'Earn 90 silver medals',
        img: "assets/images/silverquill.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 90), group: 'silverMedals'
      },
      {
        title: 'Silver Ring of Knowledge',
        content: 'Earn 100 silver medals',
        img: "assets/images/silverring.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 100), group: 'silverMedals'
      },
      {
        title: 'Silver Crystal Ball',
        content: 'Earn 120 silver medals',
        img: "assets/images/silverball.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 120), group: 'silverMedals'
      },
      {
        title: 'English Studies Silver Badge of Merit',
        content: 'Earn 150 silver medals',
        img: "assets/images/silverbadge.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 150), group: 'silverMedals'
      },
      {
        title: 'Infinite Score 10', content: 'Get a Score of 10 in Infinite Mode', img: "assets/images/10.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 10), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 20', content: 'Get a Score of 20 in Infinite Mode', img: "assets/images/20.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 20), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 30', content: 'Get a Score of 30 in Infinite Mode', img: "assets/images/30.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 30), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 60', content: 'Get a Score of 60 in Infinite Mode', img: "assets/images/60.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 60), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 90', content: 'Get a Score of 90 in Infinite Mode', img: "assets/images/90.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 90), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 100', content: 'Get a Score of 100 in Infinite Mode', img: "assets/images/100.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 100), group: 'infiniteMode'
      },
      {
        title: 'Infinite Score 120', content: 'Get a Score of 120 in Infinite Mode', img: "assets/images/120.jpg",
        condicion: (this.user?.vitrina?.recordInfinito! >= 120), group: 'infiniteMode'
      },
      {
        title: 'Battle Victory 1', content: 'Win 1 Battle Mode', img: "assets/images/battle1.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 1), group: 'battleMode'
      },
      {
        title: 'Battle Victory 2', content: 'Win 2 Battle Mode', img: "assets/images/battle2.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 2), group: 'battleMode'
      },
      {
        title: 'Battle Victory 3', content: 'Win 3 Battle Mode', img: "assets/images/battle3.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 3), group: 'battleMode'
      },
      {
        title: 'Battle Victory 4', content: 'Win 4 Battle Mode', img: "assets/images/battle4.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 4), group: 'battleMode'
      },
      {
        title: 'Battle Victory 5', content: 'Win 5 Battle Mode', img: "assets/images/battle5.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 5), group: 'battleMode'
      },
      {
        title: 'Battle Victory 6', content: 'Win 6 Battle Mode', img: "assets/images/battle6.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 6), group: 'battleMode'
      },
      {
        title: 'Magic Diary', content: 'Win 7 Battle Mode', img: "assets/images/battle7.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 7), group: 'battleMode'
      },
      {
        title: 'Magic Ring', content: 'Win 8 Battle Mode', img: "assets/images/battle8.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 8), group: 'battleMode'
      },
      {
        title: 'Magic Hair Locket', content: 'Win 9 Battle Mode', img: "assets/images/battle9.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 9), group: 'battleMode'
      },
      {
        title: 'Magic Cup', content: 'Win 10 Battle Mode', img: "assets/images/battle10.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 10), group: 'battleMode'
      },
      {
        title: 'Magic Diadem', content: 'Win 11 Battle Mode', img: "assets/images/battle11.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 11), group: 'battleMode'
      },
      {
        title: 'Magic Snake', content: 'Win 12 Battle Mode', img: "assets/images/battle12.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 12), group: 'battleMode'
      },
      {
        title: 'Magic Clock', content: 'Win 13 Battle Mode', img: "assets/images/battle13.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 13), group: 'battleMode'
      },
      {
        title: 'Magical Manuscript', content: 'Win 14 Battle Mode', img: "assets/images/battle14.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 14), group: 'battleMode'
      },
      {
        title: 'Enchanted Relic', content: 'Win 15 Battle Mode', img: "assets/images/battle15.jpg",
        condicion: (this.user?.vitrina?.victoriasBattleMode! >= 15), group: 'battleMode'
      },
      {
        title: 'Honour Student', content: 'Earn 10 gold medals and 10 silver medals', img: "assets/images/honourstudent.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 10 && this.user?.vitrina?.medallaPlata! >= 10), group: 'honourStudent'      
      },
      {
        title: 'Unstoppable', content: 'Earn 20 gold medals and 20 silver medals', img: "assets/images/unstoppable.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 20 && this.user?.vitrina?.medallaPlata! >= 20), group: 'honourStudent'
      },
      {
        title: 'Talented Magician', content: 'Earn 30 gold medals and 30 silver medals', img: "assets/images/talentedmagician.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 30 && this.user?.vitrina?.medallaPlata! >= 30), group: 'honourStudent'
      },
      {
        title: 'Top Scholar', content: 'Earn 60 gold medals and 60 silver medals', img: "assets/images/topscholar.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 60 && this.user?.vitrina?.medallaPlata! >= 60), group: 'honourStudent'
      },
      {
        title: 'Outstanding Scholar', content: 'Earn 90 gold medals and 90 silver medals', img: "assets/images/outstandingscholar.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 90 && this.user?.vitrina?.medallaPlata! >= 90), group: 'honourStudent'
      },
      {
        title: 'Academic Excellence Award', content: 'Earn 120 gold medals and 120 silver medals', img: "assets/images/academicexcellenceaward.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 120 && this.user?.vitrina?.medallaPlata! >= 120), group: 'honourStudent'
      },
      {
        title: 'Invincible Classroom Champion', content: 'Win one gold trophy in a classroom competition', img: "assets/images/invincibleAchv.jpg",
        condicion: (this.user?.vitrina?.trofeoOro! != 0), group: 'classroomChallenge'
      },
      {
        title: 'Silver Champion', content: 'Win one silver trophy in a classroom competition', img: "assets/images/silverChampion.jpg",
        condicion: (this.user?.vitrina?.trofeoPlata != 0), group: 'classroomChallenge'
      },
      {
        title: 'Bronze Champion', content: 'Win one bronze trophy in a classroom competition', img: "assets/images/bronzeChampion.jpg",
        condicion: (this.user?.vitrina?.trofeoBronce != 0), group: 'classroomChallenge'
      }
    ];

  }

  onFileSelected(event: any): void {

    this.selectedFile = event.target.files[0] ?? null;

    const formData = new FormData();
    formData.append('files', this.selectedFile, this.selectedFile.name)
    this.image.uploadFile(formData, this.user!).subscribe({
      next: (response) => {
        this.user!.image = response.image
        this.user!.image = this.image.obtenerImagen(this.user!)
        //Actualizamos el usuario guardado en las cookies
        this.auth.updateUser(this.user!)
        this.openSnackBar("profileUpdated")
      },
      error: () => this.openSnackBar("error"),
    })
  }


  openSnackBar(type: string) {
    switch (type) {
      case "error": {
        this._snackBar.open('Failed to upload profile picture', 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000,
        });
        break;
      }
      case "profileUpdated": {
        this._snackBar.open('Profile picture updated!', 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 3000
        });
      }
    }
  }

  cambioModo(modo: boolean) {
    this.modo1 = modo
  }

  public enterData(gameRecord) {
    this.userService.setRecord(gameRecord)
    this.router.navigateByUrl('gameRecordDetails')

  }
}
