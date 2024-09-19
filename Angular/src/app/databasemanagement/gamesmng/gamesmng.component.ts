import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from 'src/app/interfaces/game';
import QuestionService from 'src/app/services/question.service';
import { VentanasConfirmacionComponent } from '../ventanas-confirmacion/ventanas-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-gamesmng',
  templateUrl: './gamesmng.component.html',
  styleUrls: ['./gamesmng.component.css']
})
export class GamesmngComponent implements OnInit {

  dataSource: Game[]
  dataSorted: MatTableDataSource<Game>
  displayedColumns: string[] = ['Name', 'Code', 'Status','Options'];

  @ViewChild(MatPaginator) paginator:MatPaginator
  @ViewChild(MatSort) sort:MatSort

  constructor(private questionS:QuestionService,private router: Router,private activatedRoute:ActivatedRoute, private dialog: MatDialog){

  }
  ngOnInit(): void {
    this.questionS.getGames().subscribe({
      next: (response:any) =>{
          this.dataSource=response
          this.dataSorted = new MatTableDataSource(this.dataSource);
          this.dataSorted.sort = this.sort;
          this.dataSorted.paginator=this.paginator

      }
    }
    )
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSorted.filter = filterValue.trim().toLowerCase();
    if (this.dataSorted.paginator) {
      this.dataSorted.paginator.firstPage();
    }
  }

  changeStatus(element, status_updt){

    element.status=status_updt;
    this.questionS.updateGame(element).subscribe({
      next: () =>{

      }
    })
  }

  deleteGame(element:Game){

    this.dialog
      .open(VentanasConfirmacionComponent, {
        data: `Once you delete this game, you will have to create it again later`
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.questionS.deleteGame(element._id).subscribe({
            next: () =>{
              this.dataSource = this.dataSource.filter(item => item !== element);
              this.dataSorted.data=this.dataSource;
            }
          })
        }

      })



  }

  showDetails(element:Game){
    this.router.navigate(['/databaseManagement/gameDetails'], {queryParams:{objeto: JSON.stringify(element)}});
  }
}
