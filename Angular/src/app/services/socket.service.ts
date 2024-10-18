import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Question } from '../interfaces/question';
import { Observable } from 'rxjs';
import { ImageService } from './image.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private apiUrl = environment.preguntasApi;

  constructor(private imageService: ImageService) { }

  private socket = io(this.apiUrl, { forceNew: true });

  // Funciones existentes
  public crearSala(user: string, codigo: number) {
    this.socket.emit('crearSala', user, codigo);
  }

  public recibirSala(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('detallesSala', (pregunta: string) => {
        observer.next(pregunta);
      });
    });
  }

  public empezarJuego(codigo) {
    this.socket.emit('empezarJuego', codigo);
  }

  public recibirPregunta(): Observable<Question> {
    return new Observable((observer) => {
      this.socket.on('preguntaJuego', (pregunta: Question) => {
        let valorReturn;
        if (pregunta != null) {
          valorReturn = {
            _id: pregunta._id,
            question: pregunta.question,
            answer: pregunta.answer,
            country: pregunta.country,
            topic: pregunta.topic,
            image: this.imageService.obtenerImagenPregunta(pregunta),
            information: pregunta.information
          };
        }
        observer.next(valorReturn);
      });
    });
  }

  public siguientePregunta(sala: string) {
    this.socket.emit('siguientePregunta', sala);
  }

  public terminarPregunta(sala: string) {
    this.socket.emit('terminarPregunta', sala);
  }

  public mostrarResultado(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('mostrarResultados', (señal: any) => {
        observer.next(señal);
      });
    });
  }

  public entrarSala(user: string, sala: number) {
    this.socket.emit('entrarSala', user, sala);
  }

  public enviarResultado(user: string, score: number, sala: string) {
    this.socket.emit('resultadoFinal', user, score, sala);
  }

  public updateTimer(sala: string, timer: number) {
    this.socket.emit('updateTimer', sala, timer);
  }

  public recibirGanador(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('ganador', (info: any) => {
        observer.next(info);
      });
    });
  }

  public salirSala(sala: string, user: string) {
    this.socket.emit('salirSala', sala, user);
  }

  public cerrarSocket() {
    this.socket.disconnect();
  }

  // Nuevas funciones para el modo alumno

  // Crear sala por un alumno
  public crearSalaAlumno(user: string, codigo: number) {
    this.socket.emit('crearSalaAlumno', user, codigo);
  }

  // Unirse a sala creada por un alumno
  public entrarSalaAlumno(user: string, sala: number) {
    this.socket.emit('entrarSalaAlumno', user, sala);
  }

  // Recibir los detalles de una sala creada por un alumno
  public recibirSalaAlumno(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('detallesSalaAlumno', (info) => {
        observer.next(info);
      });
    });
  }
  
  // SocketService: Enviar preguntas al servidor para todos los jugadores
  enviarPreguntas(sala: number, preguntas: Question[]) {
    this.socket.emit('enviarPreguntas', { sala, preguntas });
  }

  // SocketService: Recibir la pregunta inicial para todos los jugadores
  public recibirPreguntasJuego(): Observable<Question[]> {
    return new Observable((observer) => {
      this.socket.on('preguntasJuego', (preguntas: Question[]) => {
        observer.next(preguntas);  // Enviar todas las preguntas
      });
    });
  }

  // Enviar la puntuación final al servidor en modo Battle Mode
  enviarResultadoAlumnoBattlemode(user: string, score: number, sala: string) {
    this.socket.emit('resultadoAlumno_battlemode', user, score, sala);
  }

  // Recibir los resultados parciales de otros jugadores en modo Battle Mode
  recibirResultadosParcialesBattlemode(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('resultadosParciales_battlemode', (resultado) => {
        observer.next(resultado);
      });
    });
  }

  // Recibir los resultados finales cuando todos los jugadores terminen en modo Battle Mode
  recibirResultadosFinalesBattlemode(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('mostrarResultadosFinales_battlemode', (resultados) => {
        observer.next(resultados);
      });
    });
  }

}
