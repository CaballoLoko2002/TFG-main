import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';  // Servicio de sockets
import { AuthService } from 'src/app/services/auth.service';  // Para obtener el correo del usuario
import QuestionService from 'src/app/services/question.service';  // Servicio para obtener preguntas y temas
import { Temas } from 'src/app/interfaces/temas';  // Interfaz para temas
import { MatDialog } from '@angular/material/dialog';  // Para manejar los diálogos
import { EsperarResultadosModalComponent } from '../classroom-challenge/esperar-resultados-modal/esperar-resultados-modal.component'; // Diálogo para esperar resultados
import { Question } from 'src/app/interfaces/question';
import { SkipQuestionDialogComponent } from '../skip-question-dialog/skip-question-dialog.component';  // Importar componente de omitir pregunta
import { MatDialogRef } from '@angular/material/dialog';  // Importar MatDialogRef

@Component({
  selector: 'app-battlemode',
  templateUrl: './battlemode.component.html',
  styleUrls: ['../classroom-challenge/class-room-challenge-test/class-room-challenge-test.component.css', '../singleplayer/singleplayer.component.css']
})
export class BattlemodeComponent implements OnInit {

  // Declaración de las propiedades existentes...
  estado: string = 'inicio';
  codigo: number = 0;
  codigoSala: number | null = null;
  errorSala: boolean = false;
  jugadores: string[] = [];
  userEmail?: string;
  timerEnabled: boolean = false;
  tiempo: number = 20;
  paisSeleccionado: string;
  temaSeleccionado: string;

  // Variables del juego
  form: FormGroup;
  temas_response: Temas;
  UK: any;
  USA: any;
  preguntas: Question[] = [];  // Definir la propiedad preguntas (conjunto de preguntas)
  pregunta: Question;  // Pregunta actual
  indicePregunta: number = 0;
  puntuacion: number = 0;
  respuestasEnviadas: number = 0;
  respuesta: string[]
  correcto: boolean = true;
  palabras: any[];
  preguntaTerminada: boolean = false;
  skipQuestionDialogRef: MatDialogRef<SkipQuestionDialogComponent> | null = null;

  // Temporizador para el juego
  @ViewChild('basicTimer') temporizador;

  constructor(
    private router: Router,
    private socketService: SocketService,
    private authService: AuthService,
    private questionS: QuestionService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      if (user) {
        this.userEmail = user.correo;  // Obtener el correo del usuario
      }
    });

    // Crear el formulario de selección de país y tema
    this.form = this._formBuilder.group({
      country: ["UK", Validators.required],
      topic: ["", Validators.required],
    });

    // Obtener los temas disponibles
    this.questionS.getTemas().subscribe({
      next: (results: Temas) => {
        this.temas_response = results;
        this.UK = [
          { title: "Geography", value: this.temas_response.UK['Geography'] },
          { title: "History", value: this.temas_response.UK['History'] },
          { title: "Society", value: this.temas_response.UK['Society'] },
          { title: "General Knowledge", value: this.temas_response.UK['General Knowledge'] },
          { title: "Mix", value: this.temas_response.UK['Mix'] },
        ];

        this.USA = [
          { title: "Geography", value: this.temas_response.USA['Geography'] },
          { title: "History", value: this.temas_response.USA['History'] },
          { title: "Society", value: this.temas_response.USA['Society'] },
          { title: "General Knowledge", value: this.temas_response.USA['General Knowledge'] },
          { title: "Mix", value: this.temas_response.USA['Mix'] },
        ];
      }
    });
  }

  // Método para manejar el envío del formulario
  submit() {
    this.paisSeleccionado = this.form.get('country')?.value;
    this.temaSeleccionado = this.form.get('topic')?.value;

    console.log(`Country: ${this.paisSeleccionado}, Topic: ${this.temaSeleccionado}`);
  }

  // Crear una sala
  createRoom() {
    if (!this.userEmail) return;

    this.codigo = Math.floor(10000 + Math.random() * 90000); // Generar un código de sala
    this.socketService.crearSalaAlumno(this.userEmail, this.codigo);  // Crear la sala

    this.jugadores.push(this.userEmail);  // Añadir el anfitrión a la lista de jugadores
    this.socketService.recibirSalaAlumno().subscribe((info) => {
      if (info === 'error') {
        this.errorSala = true;
      } else {
        this.jugadores = info.players;
      }
    });

    this.estado = 'waitingForPlayers';
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

  // Unirse a una sala
  joinRoom() {
    this.estado = 'joinRoom';
  }

  // Método para unirse a una sala existente
  entrarSala() {
    if (!this.userEmail || this.codigoSala === null) {
      this.errorSala = true;
      return;
    }

    this.socketService.entrarSalaAlumno(this.userEmail, this.codigoSala);
    this.socketService.recibirSalaAlumno().subscribe((info) => {
      if (info === 'error') {
        this.errorSala = true;
        this.estado = 'joinRoom';
      } else {
        this.jugadores = info.players;
        this.errorSala = false;
        this.estado = 'waitingForGame';
      }
    });
  }

  // Enviar respuesta del jugador
  sendAnswer(respuesta: string) {
    if (!this.userEmail) {
      console.error("User email is undefined. Cannot send answer.");
      return;
    }

    // Incrementar el contador de respuestas y enviar la respuesta
    this.respuestasEnviadas++;
    this.socketService.enviarResultadoAlumno(this.userEmail, this.puntuacion, this.codigo.toString());

    // Avanzar a la siguiente pregunta o esperar el resultado si todos han respondido
    console.log(`Answer sent: ${respuesta}`);
  }



  // Método timeOut que cierra el diálogo si se acaba el tiempo
  timeOut() {
    if (this.skipQuestionDialogRef) {
      this.skipQuestionDialogRef.close();  // Cierra el diálogo si está abierto
      this.skipQuestionDialogRef = null;
    }
    this.sendResults();  // Enviar los resultados si el temporizador termina
  }


  // Inicio del juego
  startGame() {
    const pais = this.form.get('country')?.value;
    const tema = this.form.get('topic')?.value;

    console.log(`Starting game with country: ${pais}, topic: ${tema}`);

    if (!this.userEmail) {
      console.error("User email is undefined. Cannot start the game.");
      return;
    }

    // Obtener preguntas del servicio (esto ya lo haces)
    this.questionS.getQuestionsSinglePlayer(pais, tema).subscribe({
      next: (preguntas: Question[]) => {
        if (preguntas.length > 0) {
          this.preguntas = preguntas; // Almacenar todas las preguntas
          this.pregunta = this.preguntas[this.indicePregunta]; // Tomar la primera pregunta
          this.estado = 'enPartida';  // Cambiar el estado a 'enPartida'
          console.log('Pregunta recibida:', this.pregunta);
          this.temporizador.start();  // Inicia el temporizador (si está habilitado)
        } else {
          console.error('No se encontraron preguntas');
        }
      },
      error: (error) => {
        console.error('Error al obtener preguntas:', error);
      }
    });
  }

  finalizarJuego() {
    this.estado = 'finPartida';  // Cambiar el estado a 'finPartida'
    if (this.timerEnabled) {
      this.temporizador.stop();  // Detener el temporizador si está activado
    }
    console.log('Juego terminado. Puntuación final:', this.puntuacion);
    // Aquí podrías mostrar un diálogo o redirigir a una pantalla de resultados.
  }

  nextQuestion(resultado: boolean) {
    // Si la respuesta es correcta, incrementar puntuación
    if (resultado) {
      this.puntuacion += 10;  // Incrementar puntuación por respuesta correcta
    }

    this.indicePregunta++;  // Avanzar al índice de la siguiente pregunta

    // Comprobar si quedan más preguntas
    if (this.indicePregunta < this.preguntas.length) {
      this.pregunta = this.preguntas[this.indicePregunta];  // Actualizar nueva pregunta
      this.preguntaTerminada = false;  // Reiniciar estado de la pregunta
      if (this.timerEnabled) {
        this.temporizador.reset();  // Reiniciar el temporizador
        this.temporizador.start();  // Comenzar el temporizador para la nueva pregunta
      }
    } else {
      // No hay más preguntas, finalizar el juego y mostrar resultados
      this.finalizarJuego();
    }
  }

  // Método para confirmar saltar pregunta
  confirmSkipQuestion(): void {
    this.skipQuestionDialogRef = this.dialog.open(SkipQuestionDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to skip this question?' }
    });

    // Suscribirse para saber cuándo se cierra el diálogo
    this.skipQuestionDialogRef.afterClosed().subscribe(result => {
      this.skipQuestionDialogRef = null;  // Limpiar referencia al cerrar
      if (result === true) {
        this.nextQuestion(false);  // Saltar a la siguiente pregunta
      }
    });
  }

  sendResults() {
    const resultado = this.checkResults();  // Verificar si la respuesta es correcta
    this.preguntaTerminada = true;  // Indicar que la pregunta ha terminado
    this.nextQuestion(resultado);  // Pasar a la siguiente pregunta
  }


  checkResults(): boolean {
    let correct = true;
    for (let i = 0; i < this.palabras.length; i++) {
      if (this.respuesta[i] == undefined || this.palabras[i].palabra !== this.respuesta[i].toUpperCase()) {
        correct = false;
      }
    }
    return correct;
  }

  public handleEnter(event: KeyboardEvent) {
    // Verifica si la tecla presionada es "Enter"
    if (event.key === "Enter") {
      event.preventDefault();  // Prevenir el comportamiento predeterminado del navegador (opcional)
      this.sendResults();
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

  onCodeChanged(code: string, posicion) {
    this.respuesta[posicion] = code
  }
}
