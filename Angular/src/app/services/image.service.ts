import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../interfaces/user';
import { Question } from '../interfaces/question';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl=environment.userApi;
  private apiQuestionsUrl=environment.preguntasApi;
  private profileDefault="https://robohash.org/"

  constructor(private http: HttpClient) {
  }

  uploadFile(formData:FormData,user:User): Observable<any>{

    return this.http.post<any>(`${this.apiUrl}/usuarios/${user._id}`,formData,{
      headers: {'enctype': 'multipart/form-data'}})
  }

  obtenerImagen(user:User): string{
    if(user.image!=""){
    return `${this.apiUrl}/imagen/${user.image!} `
    }
    else{
      return `${this.profileDefault}/${user._id}?set=set3`
    }
  }

  obtenerImagenPregunta(question:Question):any{
    if(question.image!=""){
      return `${this.apiQuestionsUrl}/imagen/${question.image!} `
      }
    return "";
  }



}

