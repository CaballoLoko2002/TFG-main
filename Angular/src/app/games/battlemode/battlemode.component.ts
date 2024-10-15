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
  pregunta: Question;  // Pregunta actual
  indicePregunta: number = 0;
  puntuacion: number = 0;
  respuestasEnviadas: number = 0;
  respuesta: string[]
  correcto: boolean = true;
  palabras: any[];
  preguntaTerminada: boolean = false;  

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



  // Temporizador agotado, avanzar a la siguiente pregunta
  timeOut() {
    this.sendAnswer('');  // Enviar respuesta vacía si el tiempo se acaba
  }

  // Inicio del juego
  startGame() {
    // Obtener los valores del formulario directamente en el momento de iniciar el juego
    const pais = this.form.get('country')?.value;
    const tema = this.form.get('topic')?.value;

    console.log(`Starting game with country: ${pais}, topic: ${tema}`);

    if (!this.userEmail) {
      console.error("User email is undefined. Cannot start the game.");
      return;
    }

    // Aquí se hace la llamada para obtener preguntas del servicio
    this.questionS.getQuestionsSinglePlayer(pais, tema).subscribe({
      next: (preguntas: Question[]) => {
        if (preguntas.length > 0) {
          this.pregunta = preguntas[this.indicePregunta]; // Tomamos la primera pregunta
          this.estado = 'enPartida';  // Cambiamos el estado a 'enPartida'
          console.log('Pregunta recibida:', this.pregunta);
        } else {
          console.error('No se encontraron preguntas');
        }
      },
      error: (error) => {
        console.error('Error al obtener preguntas:', error);
      }
    });
  }

  sendResults() {
  
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
