import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Question } from 'src/app/interfaces/question';
import QuestionService from 'src/app/services/question.service';
import { VentanasConfirmacionComponent } from '../ventanas-confirmacion/ventanas-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentanaExitoComponent } from '../ventana-exito/ventana-exito.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


@Component({
  selector: 'app-preguntasmng',
  templateUrl: './preguntasmng.component.html',
  styleUrls: ['./preguntasmng.component.css']
})
export class PreguntasmngComponent implements OnInit {


  //VARIABLES BÁSICAS DE FUNCIONAMIENTO
  dataSource: Question[];
  dataSorted: MatTableDataSource<Question>
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  displayedColumns: string[] = ['Title', 'Answer', 'Country', 'Topic', 'Image', 'Information', 'Options'];
  countryFilter: string;
  topicFilter: string;
  respFilter: string;

  //VARIABLE QUE IDENTIFICA EL MODO DE LA VENTANA Y PROPIAS DEL MODO DE CREACION DE JUEGO
  @Input() gameCreation: boolean;
  dataSelected: Question[] = []
  dataSelectedTable: MatTableDataSource<Question>
  preguntasIn: number = 0;
  form: FormGroup;
  nombreJuego: string = '';

  horizontalPosition : MatSnackBarHorizontalPosition='start';
  verticalPosition: MatSnackBarVerticalPosition='bottom';

  constructor(private questionS: QuestionService, public dialog: MatDialog, private router: Router, private activatedRoute: ActivatedRoute, private _formBuilder: FormBuilder,private _snackBar:MatSnackBar ) {

  }

  ngOnInit(): void {


    //SI RECIBIMOS UN PARÁMETRO A TRAVÉS DE LA URL ENTONCES ESTAMOS EN EL MODO DE CREACIÓN DE JUEGO
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      if (params.get('gameCreation') == "true") {
        this.gameCreation = true;
        this.dataSelectedTable = new MatTableDataSource(this.dataSelected);
        this.form = this._formBuilder.group({
          name: ['', Validators.required],
        })
      }

    })

    this.questionS.getAllQuestions().subscribe({
      next: (results: any) => {
        this.dataSource = results
        this.dataSorted = new MatTableDataSource(this.dataSource);
        this.dataSorted.filterPredicate = this.customFiltered();
        this.dataSorted.paginator = this.paginator

      },
      error: (error: any) => console.log(error),
    }
    );
  }

  applyFilter(country: string, topic: string, resp: string) {

    this.dataSorted.filter = country + "," + topic + "," + resp

    if (this.dataSorted.paginator) {
      this.dataSorted.paginator.firstPage();
    }
  }


  customFiltered() {
    return (data) => {
      if (this.respFilter) {
        if (this.topicFilter && this.countryFilter)
          return data.topic == this.topicFilter && data.country == this.countryFilter && data.answer.toLocaleUpperCase().includes(this.respFilter.toLocaleUpperCase())
        if (this.topicFilter)
          return data.topic == this.topicFilter && data.answer.toLocaleUpperCase().includes(this.respFilter.toLocaleUpperCase())
        if (this.countryFilter)
          return data.country == this.countryFilter && data.answer.toLocaleUpperCase().includes(this.respFilter.toLocaleUpperCase())

        return data.answer.toLocaleUpperCase().includes(this.respFilter.toLocaleUpperCase())
      }
      else {
        if (this.topicFilter && this.countryFilter)
          return data.topic == this.topicFilter && data.country == this.countryFilter
        if (this.topicFilter)
          return data.topic == this.topicFilter
        if (this.countryFilter)
          return data.country == this.countryFilter
        return true
      }

    }
  }

  clearFilters() {
    this.countryFilter = ""
    this.topicFilter = ""
    this.respFilter = ""
    this.applyFilter(this.countryFilter, this.topicFilter, this.respFilter)
  }


  //FUNCIONES DEL MODO DE VISUALIZACIÓN DE LAS PREGUNTAS
  deleteQuestion(question) {

    this.dialog
      .open(VentanasConfirmacionComponent, {
        data: `Once you delete this question you will lose access to its data`
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.questionS.deleteQuestion(question._id).subscribe({
            next: () => {
              this.dataSource = this.dataSource.filter(item => item !== question);
              this.dataSorted.data = this.dataSource;
            }
          })
        }

      })


  }

  modifyQuestion(question) {
    this.router.navigate(['/databaseManagement/crearPregunta'], { queryParams: { objeto: JSON.stringify(question) } });
  }

  //FUNCIONES DEL MODO DE CREACIÓN DE JUEGO

  addQuestion(question) {


    this.dataSelected.push(question)
    this.dataSelectedTable.data = this.dataSelected;

    //Eliminamos de la tabla total
    this.dataSource = this.dataSource.filter(item => item !== question);
    this.dataSorted.data = this.dataSource;
    this.preguntasIn++;


  }

  removeQuestionGame(question) {
    this.dataSource.push(question)
    this.dataSorted.data = this.dataSource;


    //Eliminamos de la tabla total
    this.dataSelected = this.dataSelected.filter(item => item !== question);
    this.dataSelectedTable.data = this.dataSelected;

    this.preguntasIn--;

  }


  createGame() {
    this.nombreJuego = this.form.get('name')?.value!
    const ids_preguntas = this.dataSelected.map(pregunta => pregunta._id)


    if(this.preguntasIn!=0){
    this.questionS.createGame(this.nombreJuego, ids_preguntas).subscribe({
      next: () => {
        this.dialog
          .open(VentanaExitoComponent, {})
          .afterClosed()
          .subscribe(() => {
              this.router.navigate(['databaseManagement'])

          })
      }
    })
  }
  else{
    this.openSnackBar();
  }

  }

  private openSnackBar(){
    this._snackBar.open('You have to add at least one question to the game','Close',{
      horizontalPosition:this.horizontalPosition,
      verticalPosition:this.verticalPosition,
      duration: 3000
    })
  }



}
