import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { Question } from 'src/app/interfaces/question';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import QuestionService from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { VentanaFinPreguntaComponent } from '../ventana-fin-pregunta/ventana-fin-pregunta.component';
import { SkipQuestionDialogComponent } from '../skip-question-dialog/skip-question-dialog.component';


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
  skipQuestionDialogRef: MatDialogRef<SkipQuestionDialogComponent> | null = null;
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

  leerPregunta(): void {
    if (this.preguntaActual.country === 'UK') {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(this.preguntaActual.question);
        utterance.lang = 'en-GB'; 
        synth.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
      }
    } else {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(this.preguntaActual.question);
        utterance.lang = 'en-US'; 
        synth.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
      }
    }
    
  }

  sendResults() {
    let resultado = this.checkResults();
    if (resultado) {
      this.nextQuestion(resultado);
    }
  }

  timeOut() {
    if (this.skipQuestionDialogRef) {
      this.skipQuestionDialogRef.close(); // Cierra el diálogo
      this.skipQuestionDialogRef = null;  // Limpiar la referencia
    }
    this.nextQuestion(this.checkResults())
  }

  checkResults(): boolean {
    let correct = true

    //COMPROBAMOS LA RESPUESTA
    for (let i = 0; i < this.numeroPalabras; i++) {
      if (this.respuesta[i] == undefined) {
        correct = false
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
      this.questionS.incrementarAcierto(this.preguntaActual._id).subscribe()
    }
    else {
      this.vidas--;
      this.preguntasIncorrectas++
      this.questionS.incrementarFallo(this.preguntaActual._id).subscribe()
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
    this.gameRecord.fecha = new Date().toString()
    this.user?.history?.push(this.gameRecord)
    this.auth.updateUser(this.user!)

    this.userS.sendGameResults(this.user?._id!, this.gameRecord).subscribe()

    // Enviamos las estadísticas de la partida al backend**
    this.userS.sendEstadisticas('InfinityMode', this.puntuacion, this.preguntasIncorrectas)
      .subscribe({
        next: (response) => console.log('Estadísticas enviadas correctamente', response),
        error: (error) => console.error('Error al enviar estadísticas', error)
      });

  }

  construirHistorial() {
    let entrada = {
      question: this.preguntaActual.question,
      correctAnswer: this.preguntaActual.answer,
      answer: this.respuesta.join(" ")
    }
    this.gameRecord.answers.push(entrada);




  }

  confirmSkipQuestion(): void {
    // Abre el diálogo y guarda la referencia
    this.skipQuestionDialogRef = this.dialog.open(SkipQuestionDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to skip this question?' }
    });

    // Suscribirse para saber cuando el diálogo se cierra
    this.skipQuestionDialogRef.afterClosed().subscribe(result => {
      this.skipQuestionDialogRef = null; // Limpiar la referencia cuando se cierra
      if (result === true) {
        this.nextQuestion(false);
      }
    });
  }

  public handleKeyDown(event: KeyboardEvent, posicionActual: number) {
    const LEFT_ARROW_KEY = 37;
    const RIGHT_ARROW_KEY = 39;

    // Si se presiona la flecha derecha, simular la tecla Tab
    if (event.keyCode === RIGHT_ARROW_KEY) {
      event.preventDefault(); // Prevenir el comportamiento por defecto
      const focusableElements = Array.from(document.querySelectorAll('input, button, select, textarea, a[href]')) as HTMLElement[];
      const index = focusableElements.indexOf(document.activeElement as HTMLElement);
      if (index >= 0 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }

    // Si se presiona la flecha izquierda, simular Shift + Tab
    if (event.keyCode === LEFT_ARROW_KEY) {
      event.preventDefault(); // Prevenir el comportamiento por defecto
      const focusableElements = Array.from(document.querySelectorAll('input, button, select, textarea, a[href]')) as HTMLElement[];
      const index = focusableElements.indexOf(document.activeElement as HTMLElement);
      if (index > 0) {
        focusableElements[index - 1].focus();
      }
    }
  }
}
