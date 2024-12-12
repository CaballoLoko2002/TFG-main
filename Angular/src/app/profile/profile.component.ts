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
  title: String; content: String; img: String, condicion: boolean
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
        condicion: (this.user?.vitrina?.medallaOro! >= 10)
      },
      {
        title: 'Golden Broomstick', content: 'Earn 20 gold medals', img: "assets/images/goldbroom.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 20)
      },
      {
        title: 'Golden Magic Pen', content: 'Earn 30 gold medals', img: "assets/images/goldpen.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 30)
      },
      {
        title: 'Golden Magic Potion', content: 'Earn 40 gold medals', img: "assets/images/goldpotion.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 40)
      },
      {
        title: 'Golden Magic Sword', content: 'Earn 50 gold medals', img: "assets/images/goldsword.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 50)
      },
      {
        title: 'Golden Magic Wand', content: 'Earn 60 gold medals', img: "assets/images/goldmagicwand.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 60)
      },
      {
        title: 'Golden Magical Wisdom', content: 'Earn 70 gold medals', img: "assets/images/goldwisdom.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 70)
      },
      {
        title: 'Golden Rays of Knowledge', content: 'Earn 80 gold medals', img: "assets/images/goldrays.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 80)
      },
      {
        title: 'Golden Quill', content: 'Earn 90 gold medals', img: "assets/images/goldquill.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 90)
      },
      {
        title: 'Gold Ring of Knowledge', content: 'Earn 100 gold medals', img: "assets/images/goldring.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 100)
      },
      {
        title: 'Golden Crystal Ball', content: 'Earn 120 gold medals', img: "assets/images/goldenball.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 120)
      },
      {
        title: 'English Studies Gold Badge of Merit', content: 'Earn 150 gold medals', img: "assets/images/goldbadge.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 150)
      },
      {
        title: 'Faculty of Magical Humanities: Accepted for Admission',
        content: 'Earn 10 silver medals',
        img: "assets/images/silverfaculty.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 10)
      },
      {
        title: 'Silver Broomstick',
        content: 'Earn 20 silver medals',
        img: "assets/images/silverbroom.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 20)
      },
      {
        title: 'Silver Magic Pen',
        content: 'Earn 30 silver medals',
        img: "assets/images/silverpen.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 30)
      },
      {
        title: 'Silver Magic Potion',
        content: 'Earn 40 silver medals',
        img: "assets/images/silverpotion.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 40)
      },
      {
        title: 'Silver Magic Sword',
        content: 'Earn 50 silver medals',
        img: "assets/images/silversword.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 50)
      },
      {
        title: 'Silver Magic Wand',
        content: 'Earn 60 silver medals',
        img: "assets/images/silvermagicwand.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 60)
      },
      {
        title: 'Silver Magical Wisdom',
        content: 'Earn 70 silver medals',
        img: "assets/images/silverwisdom.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 70)
      },
      {
        title: 'Silver Rays of Knowledge',
        content: 'Earn 80 silver medals',
        img: "assets/images/silverrays.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 80)
      },
      {
        title: 'Silver Quill',
        content: 'Earn 90 silver medals',
        img: "assets/images/silverquill.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 90)
      },
      {
        title: 'Silver Ring of Knowledge',
        content: 'Earn 100 silver medals',
        img: "assets/images/silverring.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 100)
      },
      {
        title: 'Silver Crystal Ball',
        content: 'Earn 120 silver medals',
        img: "assets/images/silverball.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 120)
      },
      {
        title: 'English Studies Silver Badge of Merit',
        content: 'Earn 150 silver medals',
        img: "assets/images/silverbadge.jpg",
        condicion: (this.user?.vitrina?.medallaPlata! >= 150)
      },
      {
        title: 'Honour Student', content: 'Earn 10 gold medals and 10 silver medals', img: "assets/images/honourstudent.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 10 && this.user?.vitrina?.medallaPlata! >= 10)
      },
      {
        title: 'Unstoppable', content: 'Earn 20 gold medals and 20 silver medals', img: "assets/images/unstoppable.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 20 && this.user?.vitrina?.medallaPlata! >= 20)
      },
      {
        title: 'Talented Magician', content: 'Earn 30 gold medals and 30 silver medals', img: "assets/images/talentedmagician.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 30 && this.user?.vitrina?.medallaPlata! >= 30)
      },
      {
        title: 'Top Scholar', content: 'Earn 60 gold medals and 60 silver medals', img: "assets/images/topscholar.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 60 && this.user?.vitrina?.medallaPlata! >= 60)
      },
      {
        title: 'Outstanding Scholar', content: 'Earn 90 gold medals and 90 silver medals', img: "assets/images/outstandingscholar.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 90 && this.user?.vitrina?.medallaPlata! >= 90)
      },
      {
        title: 'Academic Excellence Award', content: 'Earn 120 gold medals and 120 silver medals', img: "assets/images/academicexcellenceaward.jpg",
        condicion: (this.user?.vitrina?.medallaOro! >= 120 && this.user?.vitrina?.medallaPlata! >= 120)
      },
      {
        title: 'Invincible Classroom Champion', content: 'Win one gold trophy in a classroom competition', img: "assets/images/invincibleAchv.jpg",
        condicion: (this.user?.vitrina?.trofeoOro! != 0)
      },
      {
        title: 'Silver Champion', content: 'Win one silver trophy in a classroom competition', img: "assets/images/silverChampion.jpg",
        condicion: (this.user?.vitrina?.trofeoPlata != 0)
      },
      {
        title: 'Bronze Champion', content: 'Win one bronze trophy in a classroom competition', img: "assets/images/bronzeChampion.jpg",
        condicion: (this.user?.vitrina?.trofeoBronce != 0)
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
