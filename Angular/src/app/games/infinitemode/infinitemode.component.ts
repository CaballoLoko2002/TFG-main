import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { Question } from 'src/app/interfaces/question';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import QuestionService from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { VentanaFinPreguntaComponent } from '../ventana-fin-pregunta/ventana-fin-pregunta.component';

@Component({
  selector: 'app-infinitemode',
  templateUrl: './infinitemode.component.html',
  styleUrls: ['./infinitemode.component.css', '../singleplayer/singleplayer.component.css']
})
export class InfinitemodeComponent implements OnInit {


  @ViewChild('basicTimer') temporizador;
  preguntaActual: Question;
  indicePregunta: number = 0;
  palabras: any[]
  respuesta: string[]
  numeroPalabras: number;
  imagenesVidas: any
  vidas: number;
  tiempo: number
  puntuacion: number = 0;
  fin: boolean = false;

  preguntasIncorrectas: number = 0;


  correcto: boolean = true;

  //Variables para el historial
  user?: User | null
  gameRecord: GameRecord = <GameRecord>{}


  constructor(private questionS: QuestionService, private auth: AuthService, private userS: UserService, public dialog: MatDialog) {

  }
  ngOnInit(): void {

    //Inicializacion parametros del juego
    this.vidas = 2;
    this.imagenesVidas = Array(this.vidas).fill(null);
    this.tiempo = 60;





    this.auth.user.subscribe(x => this.user = x)


    this.gameRecord.gameMode = 'Infinite Mode'
    this.gameRecord.answers = [];

    this.questionS.getQuestionInfinite().subscribe({
      next: (results: any) => {
        this.preguntaActual = results
        this.actualizarPregunta()

      }
    })

  }

  actualizarPregunta() {

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
      this.puntuacion += 1;
    }

    else {
      this.vidas--;
      this.preguntasIncorrectas++
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
          correctAns: this.preguntaActual.answer
        },
        disableClose: true
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (this.vidas > 0) {
          if (confirmado) {


            this.correcto = true;
            this.temporizador.reset()
            this.temporizador.start()
            this.questionS.getQuestionInfinite().subscribe({
              next: (results: any) => {
     
                this.preguntaActual = results
                this.actualizarPregunta()

              }
            })
          }

        } else {
          this.obtenerResultadosFinal()
        }
      })


  }


  //SI NO HEMOS LLEGADO A LA ULTIMA PREGUNTA, ENTONCES CONTINUAMOS EL JUEGO

  obtenerResultadosFinal() {
    this.fin = true;
    this.gameRecord.incorrectAnswers = this.preguntasIncorrectas;
    this.gameRecord.score = this.puntuacion
    this.gameRecord.correctAnswers = this.puntuacion

    let infinitePrvRecord = this.user!.vitrina!.recordInfinito

    if (this.puntuacion > infinitePrvRecord) {
      this.user!.vitrina!.recordInfinito = this.puntuacion
    }

    this.user!.vitrina!.numPartidas = this.user!.vitrina!.numPartidas + 1
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
