import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../interfaces/user';
import { ImageService } from './image.service';
import { GameRecord } from '../interfaces/gameRecord';





@Injectable({
  providedIn: 'root'
})

export class UserService {


  private apiUrl = environment.userApi;
  private recordSelected: GameRecord;


  constructor(private http: HttpClient, private imageService: ImageService) { }

  public setRecord(record: GameRecord) {
    this.recordSelected = record
  }

  public getRecord() {
    return this.recordSelected
  }



  getUser(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/${uuid}`).pipe(
      map(user => ({
        _id: user._id,
        rol: user.rol,
        correo: user.correo,
        nombre: user.nombre,
        lastname: user.lastname,
        image: this.imageService.obtenerImagen(user),
        vitrina: user.vitrina,
        history: user.history,
        classroom_challenge: user.classroom_challenge,
        battlemode: user.battlemode,
        single_player: user.single_player,
        infinite_mode: user.infinite_mode
      }))
    )
  }



  getAlumnos(): Observable<User[]> {

    return this.http.get<User[]>(`${this.apiUrl}/usuarios/alumnos`)
      .pipe(
        map(users => users.map(user => ({
          _id: user._id,
          rol: user.rol,
          correo: user.correo,
          nombre: user.nombre,
          lastname: user.lastname,
          image: this.imageService.obtenerImagen(user),
          classroom_challenge: user.classroom_challenge,
          battlemode: user.battlemode,
          single_player: user.single_player,
          infinite_mode: user.infinite_mode

        }))));
  }

  changeToProfessor(user: User) {
    return this.http.put(`${this.apiUrl}/usuarios/aluToProf`, user)
  }

  deleteUser(_id: string) {
    return this.http.delete(`${this.apiUrl}/usuarios/${_id}`)
  }

  sendGameResults(user_id: string, gameResults: GameRecord): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/${user_id}/records`, gameResults)
  }


  getTops(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/top`)
  }

  sendEstadisticas(modo: string, respuestasCorrectas: number, respuestasIncorrectas: number) {
    const params = `?modo=${modo}&respuestasCorrectas=${respuestasCorrectas}&respuestasIncorrectas=${respuestasIncorrectas}`;
    return this.http.get<any>(`${this.apiUrl}/estadisticas/actualiza_partida${params}`);
  }

  sendEstadisticasOnline(modo: string) {
    const params = `?modo=${modo}`;
    return this.http.get<any>(`${this.apiUrl}/estadisticas/actualiza_partida_online${params}`);
  }

  sendPreguntaOnline(modo: string, respuestasCorrectas: number, respuestasIncorrectas: number) {
    const params = `?modo=${modo}&respuestasCorrectas=${respuestasCorrectas}&respuestasIncorrectas=${respuestasIncorrectas}`;
    return this.http.get<any>(`${this.apiUrl}/estadisticas/actualiza_pregunta_online${params}`);
  }

  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`)
  }



}



