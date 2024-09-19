import {HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../interfaces/user';
import { ImageService } from './image.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Permite establecer al usuario entre paginas obteniendolo
  //desde el localStorage
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  private apiUrl=environment.userApi;
  
  constructor(private http: HttpClient, private router: Router,private image: ImageService) { 

    this.userSubject= new BehaviorSubject(JSON.parse(localStorage.getItem('user')!))
    this.user= this.userSubject.asObservable();
  }

  public get userValue(){
    return this.userSubject.value;
  }

  signin(mail:string,contrasena:string):Observable<User>{
   
    return this.http.post<User>(`${this.apiUrl}/login`,{
      mail: mail, 
      contrasena: contrasena
    }
    ).pipe(map(user=> {
        user.image=this.image.obtenerImagen(user)
        sessionStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);

      
        return user;
    }));
}

  register(mail:string, name:string,lastname:string, password:string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/alumno`,{
      mail: mail, 
      name: name,
      lastname: lastname,
      passw: password
    })
  }

  comprobarMail(mail:string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/comprobarCorreo`,{
      correo:mail
    })
  }

logout() {
  // remove user from local storage to log user out
  sessionStorage.removeItem('user');
  this.userSubject.next(null);
  this.router.navigate(['/login']);
}

changePass(email:string,pass:string){
  return this.http.post<any>(`${this.apiUrl}/usuarios/chngPsswrd`,{
    email:email,
    pass:pass
  }
  )
}

updateUser(user:User){
  sessionStorage.setItem('user', JSON.stringify(user));
}
}
