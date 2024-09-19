import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { Question } from 'src/app/interfaces/question';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { VentanaFinPreguntaComponent } from '../ventana-fin-pregunta/ventana-fin-pregunta.component';

@Component({
  selector: 'app-singleplayer',
  templateUrl: './singleplayer.component.html',
  styleUrls: ['./singleplayer.component.css']
})
export class SingleplayerComponent implements OnInit {

  @ViewChild('basicTimer') temporizador;

  //Topic y pais
  topic:string;
  country:string;

  preguntas: Question[];
  preguntaActual: Question;
  indicePregunta: number = 0;
  palabras: any[];
  respuesta: string[]
  numeroPalabras: number;
  imagenesVidas: any
  vidas: number;
  tiempo: number
  puntuacion: number = 0;
  fin: boolean = false;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 10;

  correcto: boolean = true;


  //Historial
  user?: User | null
  gameRecord: GameRecord = <GameRecord>{}



  constructor(private activatedRoute: ActivatedRoute, private auth: AuthService, private userS: UserService, public dialog: MatDialog,private router: Router) {

  }

  ngOnInit(): void {


    this.topic= this.activatedRoute.snapshot.queryParamMap.get('categoria')!;
    this.country= this.activatedRoute.snapshot.queryParamMap.get('pais')!;
    this.preguntas = <Question[]>(this.activatedRoute.snapshot.data['resolvedResponse'])

    if(this.preguntas.length>0){
    this.vidas = 5;
    this.imagenesVidas = Array(this.vidas).fill(null);
    this.tiempo = 60;


    this.auth.user.subscribe(x => this.user = x)


    this.gameRecord.gameMode = 'Single Player Mode'
    this.gameRecord.correctAnswers = 0;
    this.gameRecord.answers = [];


    this.actualizarPregunta()

  }
  else{
    this.dialog
      .open(DialogError,{
        disableClose: true
      }).afterClosed()
      .subscribe(()=>{
        this.router.navigate(['/games'])
      })
  }
  }



  actualizarPregunta() {


    this.preguntaActual = this.preguntas[this.indicePregunta]
    this.indicePregunta++;

    this.palabras = []
    this.respuesta = []

    let texto = this.preguntaActual.answer.trim();
    // Dividir el texto en palabras utilizando espacios en blanco como separadores
    const palabras_divididas = texto.split(/\s+/);
    // Filtrar y eliminar elementos vacíos en caso de que haya varios espacios consecutivos
    const palabrasFiltradas = palabras_divididas.filter(palabra => palabra !== '');
    // Retornar el número de palabras
    let counter: number = 0;

    for (let pal of palabrasFiltradas) {
      this.palabras.push({ palabra: pal.toLocaleUpperCase(), longitud: pal.length, posicion: counter })
      counter++;
    }

    this.numeroPalabras = palabrasFiltradas.length;
  }



  onCodeChanged(code: string, posicion) {
    this.respuesta[posicion] = code
  }


  sendResults() {
    let resultado = this.checkResults();
    if (resultado) {
      this.nextQuestion(resultado);
    }
  }

  timeOut() {
    this.nextQuestion(this.checkResults())
  }



  checkResults(): boolean {
    let correct = true

    //COMPROBAMOS LA RESPUESTA
    for (let i = 0; i < this.numeroPalabras; i++) {
      if(this.respuesta[i]==undefined){
        correct=false
      }
      else if (this.palabras[i].palabra != this.respuesta[i].toLocaleUpperCase()) {
        correct = false
      }
    }
    this.correcto = correct;
    return correct;
  }

  nextQuestion(resultado: boolean) {
    if (resultado) {
      this.puntuacion += 10;
      this.respuestasCorrectas++;
    }

    else {
      this.vidas--;
      if (this.vidas >= 0) {
        this.imagenesVidas = Array(this.vidas).fill(null);
      }


    }

    this.construirHistorial();


    this.temporizador.stop();
    this.dialog
      .open(VentanaFinPreguntaComponent, {
        data: {
         resultado: resultado,
         correctAns:this.preguntaActual.answer
        },
        disableClose: true
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (this.vidas > 0) {
          if (confirmado) {
            if ((this.indicePregunta < this.preguntas.length)) {

              //SOLO PASAMOS A LA SIGUIENTE PREGUNTA SI NOS QUEDAN VIDAS


              this.correcto = true;
              this.temporizador.reset()
              this.temporizador.start()
              this.actualizarPregunta()



            }
            else {
              this.obtenerResultadosFinal()
            }
          }

        } else {
          this.obtenerResultadosFinal()
        }
      })


  }


  //SI NO HEMOS LLEGADO A LA ULTIMA PREGUNTA, ENTONCES CONTINUAMOS EL JUEGO

  obtenerResultadosFinal() {
    this.fin = true;
    this.respuestasIncorrectas = this.preguntas.length - this.respuestasCorrectas;
    this.gameRecord.incorrectAnswers=this.respuestasIncorrectas;
    this.gameRecord.score=this.puntuacion;
    this.gameRecord.topic= this.topic;
    this.gameRecord.country=this.country;
    if (this.respuestasCorrectas == 10) {
      this.user!.vitrina!.medallaOro! = this.user!.vitrina!.medallaOro! + 1
    } else if (this.respuestasCorrectas == 9) {
      this.user!.vitrina!.medallaPlata! = this.user!.vitrina!.medallaPlata! + 1
    } else if (this.respuestasCorrectas < 9 && this.respuestasCorrectas >= 7) {
      this.user!.vitrina!.medallaBronce! = this.user!.vitrina!.medallaBronce! + 1
    }


    this.user!.vitrina!.numPartidas=this.user!.vitrina!.numPartidas+1
    this.auth.updateUser(this.user!)


    this.gameRecord.correctAnswers = this.respuestasCorrectas
    this.gameRecord.fecha=new Date().toString()

    this.user?.history?.push(this.gameRecord)
    this.auth.updateUser(this.user!)
    this.userS.sendGameResults(this.user?._id!,this.gameRecord).subscribe()


  }

  construirHistorial() {
    let entrada = {
      question: this.preguntaActual.question,
      correctAnswer: this.preguntaActual.answer,
      answer: this.respuesta.join(" ")
    }
    this.gameRecord.answers.push(entrada);


  }

}

@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-error.html',
})
export class DialogError{

  constructor(public dialogRef: MatDialogRef<DialogError>) {}

}
