import { Component,OnInit, ViewChild } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { VentanasConfirmacionComponent } from '../ventanas-confirmacion/ventanas-confirmacion.component';

@Component({
  selector: 'app-usersmng',
  templateUrl: './usersmng.component.html',
  styleUrls: ['./usersmng.component.css']
})
export class UsersmngComponent implements OnInit {

  columnsToDisplay = ['nombre','lastname','correo','image','rol',"actions"];


  dataSource: User[]
  dataSorted: MatTableDataSource<User>
  @ViewChild(MatSort) sort:MatSort
  @ViewChild(MatPaginator) paginator:MatPaginator

  constructor (private userService: UserService, public dialog:MatDialog){

  }

  //Aqui dentro obtenemos los datos y encendemos el sorter
  ngOnInit(): void {

     this.userService.getAlumnos().subscribe({
      next: (results: any) => {
        this.dataSource=results
        this.dataSorted = new MatTableDataSource(this.dataSource);
        this.dataSorted.sort = this.sort;
        this.dataSorted.paginator=this.paginator

      },
      error: (error: any) => console.log(error),
      complete: () => console.log('Done getting users')
    }
    );
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSorted.filter = filterValue.trim().toLowerCase();
    if (this.dataSorted.paginator) {
      this.dataSorted.paginator.firstPage();
    }
  }


  changeToProfessor(user:User){
    this.dialog
    .open(VentanasConfirmacionComponent, {
      data: `Once you update the role of this user you will lose access to their data`
    })
    .afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        this.userService.changeToProfessor(user).subscribe({
          next: ()=>{
            this.dataSource = this.dataSource.filter(item => item !== user);
            this.dataSorted.data=this.dataSource;
          }
        })
      }

    })
  }

  deleteUser(user:User){
    this.dialog
    .open(VentanasConfirmacionComponent, {
      data: `Once you delete this user you will lose access to their data`
    })
    .afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        this.userService.deleteUser(user._id).subscribe({
          next:()=>{
            this.dataSource = this.dataSource.filter(item => item !== user);
            this.dataSorted.data=this.dataSource;
          }
        })
      }

    })
  }


}

