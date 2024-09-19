import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { ImageService } from './image.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map} from 'rxjs';
import { Question } from '../interfaces/question';
import { Temas } from '../interfaces/temas';
import { Game } from '../interfaces/game';


@Injectable({
  providedIn: 'root'
})
export default class QuestionService {


  private apiUrl=environment.preguntasApi;


  constructor(private http: HttpClient, private imageService: ImageService) { }



  addQuestion(form:FormData): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/preguntas`,form,{headers: {'enctype': 'multipart/form-data'}})
  }

  getAllQuestions(): Observable<Question[]>{
    return this.http.get<Question[]>(`${this.apiUrl}/preguntas`)
    .pipe(
        map(questions =>questions.map(question =>({
          _id: question._id,
          question: question.question,
          answer: question.answer,
          country: question.country,
          topic: question.topic,
          image: this.imageService.obtenerImagenPregunta(question),
          information: question.information

      })))) ;

  }

  getQuestionsSinglePlayer(pais:String,categoria:String): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/preguntas/singleplayer?pais=${pais}&categoria=${categoria}`)
    .pipe(
      map(questions =>questions.map(question =>({
        _id: question._id,
        question: question.question,
        answer: question.answer,
        country: question.country,
        topic: question.topic,
        image: this.imageService.obtenerImagenPregunta(question),
        information: question.information

    })))) ;
  }

  deleteQuestion(_id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/preguntas/${_id}`)
  }

  editQuestion(_id:string,form:FormData):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/preguntas/${_id}`,form,{headers: {'enctype': 'multipart/form-data'}})
  }

  getTemas():Observable<Temas>{
    return this.http.get<Temas>(`${this.apiUrl}/temas`);
  }

  updateTemas(temas:Temas): Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/temas`,temas)
  }

  createGame(name:string,ids:String[]): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/games`,{
        "nombre":name,
        "preguntas":ids
    })
  }

  getGames(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/games`)
  }

  updateGame(game:Game):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/games`,game)
  }

  deleteGame(id:String):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/games/${id}`)
  }

  getGameQuestions(id:String):Observable<Question[]>{
    return this.http.get<Question[]>(`${this.apiUrl}/games/${id}/preguntas`).pipe(
      map(questions =>questions.map(question =>({
        _id: question._id,
        question: question.question,
        answer: question.answer,
        country: question.country,
        topic: question.topic,
        image: this.imageService.obtenerImagenPregunta(question),
        information: question.information

    }))))
  }

  getQuestionInfinite():Observable<Question>{
    return this.http.get<Question>(`${this.apiUrl}/preguntas/infinite`).pipe(
      map(
        question =>({
          _id: question._id,
          question: question.question,
          answer: question.answer,
          country: question.country,
          topic: question.topic,
          image: this.imageService.obtenerImagenPregunta(question),
          information: question.information
        })
      )
    )
  }



}
