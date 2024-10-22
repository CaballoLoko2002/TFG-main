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
import { VentanaAciertoPreguntaComponent } from '../ventana-acierto-pregunta/ventana-acierto-pregunta.component';
import { UserService } from 'src/app/services/user.service';

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
  resultadosFinales: { user: string, score: number }[] = [];

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
  respuesta: string[];
  correcto: boolean = true;
  palabras: any[];
  preguntaTerminada: boolean = false;
  skipQuestionDialogRef: MatDialogRef<SkipQuestionDialogComponent> | null = null;
  acumulado: number = 0;  // Segundos acumulados del temporizador

  //VARIABLES DE LA CLASIFICACION
  clasification: any;
  winner: any;
  index: number = 1;
  respuestasCorrectas: number = 0;
  respuestasIncorrectas: number = 0;


  // Temporizador para el juego
  @ViewChild('basicTimer') temporizador;


  constructor(
    private router: Router,
    private socketService: SocketService,
    private authService: AuthService,
    private questionS: QuestionService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    public userService: UserService
  ) { }

  ngOnDestroy(): void {
    // Verifica si el usuario está en una sala y sale de la sala antes de destruir el componente
    if (this.codigo !== 0 && this.userEmail) {
      this.socketService.salirSalaAlumno(this.codigo.toString(), this.userEmail);
    }

  }

  handleEnterPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.sendResults();
    }
  };

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
      maximo: ["", [Validators.required, Validators.min(1)]],
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

    // **Aquí agregamos la suscripción para recibir las preguntas cuando se envíen por el socket**
    this.socketService.recibirPreguntasJuego().subscribe((preguntas: Question[]) => {
      this.preguntas = preguntas;  // Almacenar todas las preguntas
      this.pregunta = this.preguntas[this.indicePregunta];
      this.actualizarPregunta();  // Inicializar las palabras aquí
      this.estado = 'enPartida';

      // Si el temporizador está habilitado, iniciarlo
      if (this.timerEnabled) {
        this.temporizador.start();
      }
    });

    // Suscribirse para recibir actualizaciones del temporizador
    this.socketService.recibirActualizacionTemporizador().subscribe((data) => {
      this.tiempo = data.tiempo;
      this.timerEnabled = true;  // Asegurarse de habilitar el temporizador
      console.log('Temporizador actualizado:', this.tiempo);

      // Verificar si la referencia al temporizador está disponible
      if (this.temporizador) {
        this.temporizador.start();  // Inicia el temporizador si está disponible
      } else {
        console.error('Temporizador no disponible.');
      }
    });



    // Suscribirse para recibir resultados parciales en modo Battle Mode
    this.socketService.recibirResultadosParcialesBattlemode().subscribe((resultado: any) => {
      console.log(`${resultado.user} ha terminado con ${resultado.score} puntos`);
      // Aquí puedes actualizar la UI para mostrar los resultados parciales de los jugadores
    });

    // Suscribirse para recibir los resultados finales en modo Battle Mode
    this.socketService.recibirResultadosFinalesBattlemode().subscribe((resultados) => {
      console.log('Resultados recibidos:', resultados);  // Verifica si es una lista de objetos {user, score}

      if (Array.isArray(resultados)) {
        // Ordenar los resultados por score de mayor a menor
        this.clasification = resultados.sort((a, b) => b.score - a.score);

        // Determina el ganador, que será el primer jugador en la lista ordenada
        this.winner = this.clasification[0];  // El jugador con la mayor puntuación es el primero

        this.estado = 'resultadosFinales';  // Cambia el estado para mostrar los resultados
      } else {
        console.error('Se esperaba un array de resultados, pero se recibió:', resultados);
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
    console.log(`Intentando unirse a la sala con código: ${this.codigoSala} para el usuario: ${this.userEmail}`);

    this.socketService.entrarSalaAlumno(this.userEmail, this.codigoSala);

    this.socketService.recibirSalaAlumno().subscribe((info) => {
      if (info === 'error') {
        this.errorSala = true;
        this.estado = 'joinRoom';
        console.error("Error al intentar unirse a la sala, código incorrecto.");
      } else {
        this.jugadores = info.players;
        this.errorSala = false;
        this.estado = 'waitingForGame';
        // Asignación solo si codigoSala no es null
        if (this.codigoSala !== null) {
          this.codigo = this.codigoSala;
        }
        console.log("Unido a la sala correctamente. Jugadores en la sala:", this.jugadores);
      }
    });
  }

  // Inicio del juego para todos los jugadores
  startGame() {
    const pais = this.form.get('country')?.value;
    const tema = this.form.get('topic')?.value;
    const maximo = this.form.get('maximo')?.value; // Obtener el máximo de preguntas del formulario
  
    if (!this.userEmail) {
      console.error("User email is undefined. Cannot start the game.");
      return;
    }
  
    // Obtener las preguntas para el anfitrión
    this.questionS.getQuestionsBattleMode(pais, tema, maximo).subscribe({
      next: (preguntas: Question[]) => {
        if (preguntas.length > 0) {
          this.preguntas = preguntas;
          this.pregunta = this.preguntas[this.indicePregunta];
          this.actualizarPregunta();
          this.estado = 'enPartida';
  
          // Enviar preguntas a todos los jugadores en la sala
          this.socketService.enviarPreguntas(this.codigo, this.preguntas);
  
          // Iniciar el temporizador y enviarlo a todos los jugadores si está habilitado
          if (this.timerEnabled) {
            this.socketService.enviarTemporizador(this.codigo, this.tiempo);
            this.temporizador.start();  // Iniciar el temporizador para el anfitrión
          }
        }
      }
    });

    this.userService.sendEstadisticasOnline('Battlemode').subscribe({
      next: (response) => console.log('Estadísticas enviadas correctamente', response),
      error: (error) => console.error('Error al enviar estadísticas', error)
    });

  }


  finalizarJuego() {
    if (this.userEmail) {
      // Enviar el resultado solo si userEmail está definido
      console.log(`Enviando resultado a la sala: ${this.codigo}`);
      this.socketService.enviarResultadoAlumnoBattlemode(this.userEmail, this.puntuacion, this.codigo.toString());

      this.userService.sendPreguntaOnline('Battlemode', this.respuestasCorrectas, this.respuestasIncorrectas)
      .subscribe({
        next: (response) => console.log('Estadísticas enviadas correctamente', response),
        error: (error) => console.error('Error al enviar estadísticas', error)
      });

      this.estado = 'esperandoResultados';  // Estado de espera para los resultados de los otros jugadores
      console.log('Juego terminado. Esperando resultados...');
    } else {
      console.error("User email is undefined. Cannot send results.");
      // Aquí puedes manejar el caso en el que userEmail sea undefined, por ejemplo, mostrando un error en la UI
    }
  }

  nextQuestion() {
    // Resetear el estadoIncorrecto de todas las palabras antes de pasar a la siguiente pregunta
    this.palabras.forEach(palabra => {
      palabra.estadoIncorrecto = false;  // Resetear a false
    });

    this.correcto = true;  // Asegurarse de que el estado correcto se reinicie

    this.indicePregunta++;  // Avanzar al índice de la siguiente pregunta

    // Comprobar si quedan más preguntas
    if (this.indicePregunta < this.preguntas.length) {
      this.pregunta = this.preguntas[this.indicePregunta];  // Actualizar nueva pregunta
      this.actualizarPregunta();  // Volver a configurar la respuesta y palabras
      this.preguntaTerminada = false;  // Reiniciar el estado de la pregunta
      if (this.timerEnabled) {
        this.temporizador.reset();  // Reiniciar el temporizador
        this.temporizador.start();  // Comenzar el temporizador para la nueva pregunta
      }
    } else {
      // Si no hay más preguntas, finalizar el juego
      this.finalizarJuego();
    }
  }


  // Método timeOut que cierra el diálogo si se acaba el tiempo
  timeOut() {
    if (this.skipQuestionDialogRef) {
      this.skipQuestionDialogRef.close();  // Cierra el diálogo si está abierto
      this.skipQuestionDialogRef = null;
    }
    this.nextQuestion();  // Saltar a la siguiente pregunta
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
        this.respuestasIncorrectas++;
        console.log('Pregunta omitida. Respuestas incorrectas:', this.respuestasIncorrectas);        
        this.nextQuestion();  // Saltar a la siguiente pregunta
      }
    });
  }

  sendResults() {
    let resultado = this.checkResults();  // Verificar si la respuesta es correcta
    this.correcto = resultado;  // Asignar el resultado para aplicar estilos a los inputs

    // Solo detener el temporizador si la respuesta es correcta
    if (resultado && this.timerEnabled) {
      this.acumulado = this.temporizador.get().seconds;  // Capturar los segundos restantes
      this.temporizador.stop();  // Detener el temporizador
    }

    if (!resultado) {
      this.palabras.forEach((palabra, index) => {
        if (this.respuesta[index] !== palabra.palabra) {
          this.palabras[index].estadoIncorrecto = true;  // Marca la palabra como incorrecta para cambiar el estilo
        }
      });
    } else {
      // Incrementa la puntuación base y añade los segundos restantes
      this.puntuacion += 10 + this.acumulado;
      this.respuestasCorrectas++;
      this.preguntaTerminada = true;  // Marcar que la pregunta fue respondida correctamente

      // Abrir el diálogo de resultado similar al Single Player
      this.dialog
        .open(VentanaAciertoPreguntaComponent, {
          data: {
            resultado: resultado,  // Si la respuesta fue correcta o incorrecta
            correctAns: this.pregunta.answer  // Mostrar la respuesta correcta en el diálogo
          },
          disableClose: true  // El usuario debe interactuar con el diálogo para cerrarlo
        })
        .afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado && resultado) {
            this.nextQuestion();  // Pasar a la siguiente pregunta si se cerró el diálogo
          } else {
            // Si no es correcto o se sigue intentando, mantener la pregunta activa
            this.preguntaTerminada = false;
            if (this.timerEnabled) {
              this.temporizador.reset();
              this.temporizador.start();
            }
          }
        });
    }
  }



  checkResults(): boolean {
    let correct = true;

    // Verificar cada palabra ingresada
    for (let i = 0; i < this.palabras.length; i++) {
      if (this.respuesta[i] === undefined || this.palabras[i].palabra !== this.respuesta[i].toUpperCase()) {
        this.palabras[i].estadoIncorrecto = true;  // Marcar como incorrecta
        correct = false;
      } else {
        this.palabras[i].estadoIncorrecto = false;  // Si es correcta, no mostrar error
      }
    }

    return correct;  // Devuelve si la respuesta es correcta o no
  }

  public handleEnter(event: KeyboardEvent) {
    // Verifica si la tecla presionada es "Enter"
    if (event.key === "Enter") {
      event.preventDefault();  // Prevenir el comportamiento predeterminado del navegador (opcional)
      this.sendResults();
    }
  }

  actualizarPregunta() {
    this.palabras = [];
    this.respuesta = [];

    let texto = this.pregunta.answer.trim();
    // Dividir el texto en palabras utilizando espacios en blanco como separadores
    const palabras_divididas = texto.split(/\s+/);
    // Filtrar y eliminar elementos vacíos en caso de que haya varios espacios consecutivos
    const palabrasFiltradas = palabras_divididas.filter(palabra => palabra !== '');

    let counter: number = 0;

    // Crear las palabras para el input basado en la respuesta correcta
    for (let pal of palabrasFiltradas) {
      this.palabras.push({ palabra: pal.toLocaleUpperCase(), longitud: pal.length, posicion: counter });
      counter++;
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
    this.respuesta[posicion] = code;
  }
}
