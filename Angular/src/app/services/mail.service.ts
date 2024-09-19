import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MailService {
  
  private apiUrl=environment.userApi;

  constructor(private http: HttpClient) { }

  enviarCorreoCodigo(mail:string) : Observable<any>{
   return this.http.post<any>(`${this.apiUrl}/mensaje`,{
      email: mail, 
    });
  }

  enviarCorreoCambioCont(mail:string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/usuarios/mensajeContra`,{
      email:mail
    })
  }


  comprobarCodigo(mail:String, code:String): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/comprobarCodigo`,{
      email:mail,
      code: code
    });
  }


  

}
