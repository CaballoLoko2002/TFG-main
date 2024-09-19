import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable} from 'rxjs';
import QuestionService from './question.service';

//Este Resolver evitará cargar una pagina HTML hasta que tengamos la respuesta
//que nos proporciona al usuario y, por tanto, la información que debemos mostrar
//por pantalla

@Injectable({providedIn: 'root'})
export class QuestionResolver implements Resolve<Response> {

  constructor(private questionS: QuestionService){

  }

  //Queremos decirle a nuestra app que no vaya a la vista hasta que no se resuelva el resolver
  resolve(route: ActivatedRouteSnapshot): Observable<Response> {
    return this.questionS.getQuestionsSinglePlayer(route.queryParams['pais'],route.queryParams['categoria'])
  }
}
