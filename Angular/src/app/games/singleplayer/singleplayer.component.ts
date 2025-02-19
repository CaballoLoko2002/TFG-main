import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { Question } from 'src/app/interfaces/question';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { VentanaFinPreguntaComponent } from '../ventana-fin-pregunta/ventana-fin-pregunta.component';
import { SkipQuestionDialogComponent } from '../skip-question-dialog/skip-question-dialog.component';
import QuestionService from 'src/app/services/question.service';


@Component({
  selector: 'app-singleplayer',
  templateUrl: './singleplayer.component.html',
  styleUrls: ['./singleplayer.component.css']
})
export class SingleplayerComponent implements OnInit {

  @ViewChild('basicTimer') temporizador;

  //Topic y pais
  topic: string;
  country: string;

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
  puntuacionMix: number = 0;
  fin: boolean = false;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 0;
  skipQuestionDialogRef: MatDialogRef<SkipQuestionDialogComponent> | null = null;
  correcto: boolean = true;


  //Historial
  user?: User | null
  gameRecord: GameRecord = <GameRecord>{}



  constructor(private activatedRoute: ActivatedRoute, private auth: AuthService, private userS: UserService, public dialog: MatDialog, private router: Router, private questionS: QuestionService) {

  }

  ngOnInit(): void {

    // Lógica ya existente
    this.topic = this.activatedRoute.snapshot.queryParamMap.get('categoria')!;
    this.country = this.activatedRoute.snapshot.queryParamMap.get('pais')!;
    this.preguntas = <Question[]>(this.activatedRoute.snapshot.data['resolvedResponse'])

    if (this.preguntas.length > 0) {
      this.vidas = 5;
      this.imagenesVidas = Array(this.vidas).fill(null);
      this.tiempo = 60;

      this.auth.user.subscribe(x => this.user = x);

      this.gameRecord.gameMode = 'Single Player Mode';
      this.gameRecord.correctAnswers = 0;
      this.gameRecord.answers = [];

      this.actualizarPregunta();
    } else {
      this.dialog
        .open(DialogError, {
          disableClose: true
        }).afterClosed()
        .subscribe(() => {
          this.router.navigate(['/games']);
        });
    }

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
      this.puntuacion += 10;
      this.puntuacionMix += 10;
      this.respuestasCorrectas++;
      this.questionS.incrementarAcierto(this.preguntaActual._id).subscribe();
    }
    else {
      this.vidas--;
      this.respuestasIncorrectas++;
      this.questionS.incrementarFallo(this.preguntaActual._id).subscribe();
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


  //SI NO HEMOS LLEGADO A LA ULTIMA PREGUNTA, ENTONCES CONTINUAMOS EL JUEGO

  obtenerResultadosFinal() {
    this.fin = true;
    this.gameRecord.incorrectAnswers = this.respuestasIncorrectas;
    this.gameRecord.incorrectAnswers = this.respuestasIncorrectas;
    this.gameRecord.score = this.puntuacion;
    this.gameRecord.scoreMix = this.puntuacionMix; // Solo relevante si el topic es Mix
    this.gameRecord.topic = this.topic;
    this.gameRecord.country = this.country;

    // Si el topic es "Mix", registramos la puntuación de Mix
    if (this.gameRecord.topic === 'Mix') {
      let mixPrvRecord = this.user!.vitrina!.recordMix || 0;

      // Actualizamos el récord de Mix si la puntuación actual es mayor
      if (this.puntuacionMix > mixPrvRecord) {
        this.user!.vitrina!.recordMix = this.puntuacionMix;
      }
    } else {
      // Para otros topics, manejamos las medallas como antes
      if (this.respuestasCorrectas == 10) {
        this.user!.vitrina!.medallaOro = (this.user!.vitrina!.medallaOro || 0) + 1;
      } else if (this.respuestasCorrectas == 9) {
        this.user!.vitrina!.medallaPlata = (this.user!.vitrina!.medallaPlata || 0) + 1;
      } else if (this.respuestasCorrectas < 9 && this.respuestasCorrectas >= 7) {
        this.user!.vitrina!.medallaBronce = (this.user!.vitrina!.medallaBronce || 0) + 1;
      }
    }

    // Incrementamos el número de partidas jugadas
    this.user!.vitrina!.numPartidas = (this.user!.vitrina!.numPartidas || 0) + 1;

    // Actualizamos el usuario en la base de datos
    this.auth.updateUser(this.user!);

    // Registramos las respuestas correctas y la fecha
    this.gameRecord.correctAnswers = this.respuestasCorrectas;
    this.gameRecord.fecha = new Date().toString();

    // Añadimos el registro de la partida al historial del usuario
    this.user?.history?.push(this.gameRecord);

    // Actualizamos el usuario de nuevo en la base de datos
    this.auth.updateUser(this.user!);

    // Enviamos los resultados de la partida al backend
    this.userS.sendGameResults(this.user?._id!, this.gameRecord).subscribe();

    // Enviamos las estadísticas de la partida al backend**
    this.userS.sendEstadisticas('Singleplayer', this.respuestasCorrectas, this.respuestasIncorrectas)
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

}



@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-error.html',
})
export class DialogError {

  constructor(public dialogRef: MatDialogRef<DialogError>) { }

}
