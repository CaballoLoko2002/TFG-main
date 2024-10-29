import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { Question } from 'src/app/interfaces/question';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SocketService } from 'src/app/services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { VentanaFinPreguntaCCComponent } from '../ventana-fin-pregunta-cc/ventana-fin-pregunta-cc.component';
import { UserService } from 'src/app/services/user.service';
import { EsperarResultadosModalComponent } from '../esperar-resultados-modal/esperar-resultados-modal.component';
import  QuestionService  from 'src/app/services/question.service';


interface room {
  id: string,
  gameCode: number,
  players: string[]
  timer: number;
}
@Component({
  selector: 'app-class-room-challenge-test',
  templateUrl: './class-room-challenge-test.component.html',
  styleUrls: ['./class-room-challenge-test.component.css', '../../singleplayer/singleplayer.component.css'],
  providers: [SocketService]
})


export class ClassRoomChallengeTestComponent implements OnInit, OnDestroy {

  @ViewChild('basicTimer') temporizador;


  sala: room;
  errorSala: boolean = false;
  codigoSala: any;
  user?: User | null
  codigo: any;
  profesor: boolean = false


  //VARIABLES DEL JUEGO
  pregunta: Question
  indicePregunta: number = 0;
  palabras: any[];
  respuesta: string[]
  numeroPalabras: number;
  timerEnabled: boolean;
  tiempo: number = 20
  puntuacion: number = 0;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 10;
  correcto: boolean = true;
  estado: string = 'inicio'
  acumulado: number = 0;

  //VARIABLES DE LA CLASFICIACION
  clasification: any;
  winner: any
  index: number = 1

  //VARIABLE PARA EL PROFESOR
  preguntaTerminada: boolean = false;

  gameRecord: GameRecord = <GameRecord>{}

  constructor(private socketService: SocketService, private auth: AuthService, public dialog: MatDialog, private userS: UserService, private questionService : QuestionService) {

  }



  ngOnDestroy() {
    if (this.sala != undefined) {
      this.socketService.salirSala(this.sala.id, this.user!.correo); // Envía una señal al servidor antes de cerrar la pestaña o cambiar de vista
    }
   
    this.socketService.cerrarSocket()

  }


  ngOnInit(): void {



    this.auth.user.subscribe(x => this.user = x)
    this.gameRecord.gameMode = 'Classroom Challenge'
    this.gameRecord.correctAnswers = 0;
    this.gameRecord.answers = [];

    if (this.user?.rol == "Teacher") {
      this.profesor = true;
    }

    this.socketService.recibirSala().subscribe((info) => {

      if (info == undefined) {

        this.errorSala = true
      }
      else {
        this.sala = info;
        if (this.sala.timer == -1) {
          this.timerEnabled = false
        }
        else {
          this.timerEnabled = true
          this.tiempo = this.sala.timer
        }
      }


    });

    this.socketService.mostrarResultado().subscribe(() => {
      this.construirHistorial();

      if (this.timerEnabled) {
        this.temporizador.stop()
      }


      if (this.user?.rol == 'Student') {
        this.showResults()
      }

    })

    this.socketService.recibirGanador().subscribe((info) => {

      this.clasification = info
      this.winner = this.clasification[0]
      this.estado = 'finPartida'
      this.terminarPartida();



    })


    this.socketService.recibirPregunta().subscribe((info) => {
      this.dialog.closeAll();

      if (info != undefined) {
        this.acumulado = 0;
        this.pregunta = info;
        this.estado = 'enPartida';
        this.correcto = true;

        if (this.indicePregunta != 0) {
          this.preguntaTerminada = false
          if (this.timerEnabled) {
            this.temporizador.reset()
            this.temporizador.start()
          }

        }

        this.actualizarPregunta()
      }
      else {
        if (this.user?.rol == 'Student') {
          this.socketService.enviarResultado(this.user?.correo!, this.puntuacion, this.sala.id)
        }

      }

    })

    
  }

  //METODOS DEL SOCKET
  public crearSala() {
    if (this.codigo != undefined) {
      this.socketService.crearSala(this.user!.correo!, this.codigo)

    }
    else {
      this.errorSala = true;
    }
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


  public entrarSala() {
    if (this.codigoSala == undefined) {
      this.errorSala = true
    }
    else {
      this.socketService.entrarSala(this.user!.correo!, this.codigoSala)
    }

  }

  public empezarJuego() {
    this.socketService.empezarJuego(this.sala.id)

    this.userS.sendEstadisticasOnline("Classroom").subscribe({
      next: (response) => console.log('Estadísticas enviadas correctamente', response),
      error: (error) => console.error('Error al enviar estadísticas', error)
    });

  }

  public siguientePregunta() {
    this.socketService.siguientePregunta(this.sala.id)
  }

  public updateTimer() {
    if (this.timerEnabled) {
      this.socketService.updateTimer(this.sala.id, this.tiempo)
    }

    else {
      this.socketService.updateTimer(this.sala.id, -1)
    }

  }

  //METODOS DEL JUEGO


  construirHistorial() {
    let entrada = {
      question: this.pregunta.question,
      correctAnswer: this.pregunta.answer,
      answer: this.respuesta.join(" ")
    }
    this.gameRecord.answers.push(entrada);


  }

  onCodeChanged(code: string, posicion) {
    this.respuesta[posicion] = code
  }

  leerPregunta(): void {
    if (this.pregunta.country === 'UK') {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(this.pregunta.question);
        utterance.lang = 'en-GB';
        synth.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
      }
    } else {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(this.pregunta.question);
        utterance.lang = 'en-US';
        synth.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
      }
    }
  }

  sendResults() {
    this.dialog
      .open(EsperarResultadosModalComponent, {
        data: "",
        disableClose: true
      })
    if (this.timerEnabled) {
      this.acumulado = this.temporizador.get().seconds
      this.temporizador.stop()

    }

  }

  timeOut() {
    if (this.user?.rol == 'Teacher') {
      this.terminarPregunta()

    }
  }



  actualizarPregunta() {

    this.indicePregunta++;
    this.palabras = []
    this.respuesta = []

    let texto = this.pregunta.answer.trim();
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


  checkResults(): boolean {
    if (this.timerEnabled) {
      this.temporizador.stop();
    }

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

  showResults() {

    let resultado = this.checkResults()
    if (resultado) {
      this.puntuacion += 10 + this.acumulado;
      this.respuestasCorrectas++;
      if (this.user?.rol == 'Student') 
        this.questionService.incrementarAcierto(this.pregunta._id).subscribe()
    }
    else {
      if (this.user?.rol == 'Student')
        this.questionService.incrementarFallo(this.pregunta._id).subscribe()
    }



    this.dialog.closeAll()
    this.dialog
      .open(VentanaFinPreguntaCCComponent, {
        data: {
          resultado: resultado,
          correctAns: this.pregunta.answer,
          score: 10 + this.acumulado
        },
        disableClose: true
      })


  }

  terminarPregunta() {
    this.preguntaTerminada = true;
    this.socketService.terminarPregunta(this.sala.id);
  }


  public terminarPartida() {
    this.gameRecord.correctAnswers = this.respuestasCorrectas;
    this.respuestasIncorrectas = this.indicePregunta - this.respuestasCorrectas;
    this.gameRecord.incorrectAnswers = this.respuestasIncorrectas;
    this.gameRecord.score = this.puntuacion;
    const posicion = this.clasification.findIndex(objeto => objeto.nombre === this.user?.correo);

    if (posicion == 0) {
      this.user!.vitrina!.trofeoOro! = this.user!.vitrina!.trofeoOro! + 1
    }
    else if (posicion == 1) {
      this.user!.vitrina!.trofeoPlata! = this.user!.vitrina!.trofeoPlata! + 1
    }
    else if (posicion == 2) {
      this.user!.vitrina!.trofeoBronce! = this.user!.vitrina!.trofeoBronce! + 1
    }

    if (this.user?.rol == 'Teacher') {
      this.gameRecord.top = this.clasification;
      this.gameRecord.place = -1;
    }
    else {
      this.gameRecord.place = posicion
    }


    this.user!.vitrina!.numPartidas = this.user!.vitrina!.numPartidas + 1
    this.gameRecord.fecha = new Date().toString()
    this.user?.history?.push(this.gameRecord)
    this.auth.updateUser(this.user!)
    this.userS.sendGameResults(this.user?._id!, this.gameRecord).subscribe()

    if (this.user?.rol == 'Student') {
      this.userS.sendPreguntaOnline("Classroom", this.respuestasCorrectas, this.respuestasIncorrectas,)
        .subscribe({
          next: (response) => console.log('Estadísticas enviadas correctamente', response),
          error: (error) => console.error('Error al enviar estadísticas', error)
        });
    }
  }



}
