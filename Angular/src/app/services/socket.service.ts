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

  // Nueva función para empezar el juego en modo Battle Mode, sala ahora es un number
  public empezarJuegoAlumno(sala: number, tiempo: number) {
    this.socket.emit('empezarJuegoAlumno', sala, tiempo);
  }


  // Nueva función para enviar resultados en modo Battle Mode
  public enviarResultadoAlumno(user: string, score: number, sala: string) {
    this.socket.emit('resultadoAlumno', user, score, sala);
  }


}
