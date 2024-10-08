import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../services/user.service';

interface Ranking {
  tabName: String;
  cardText: String;
  img: String;
  imgDes: String;
  ranking: MatTableDataSource<any>;
}

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {

  @ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;

  columnsToDisplay = ['No', 'Nombre', 'Score'];
  rankings: Ranking[];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getTops().subscribe({
      next: (results: any) => {
        this.rankings = [
          { tabName: "Gold Medals", cardText: "Top gold medals", img: "assets/images/goldMedal.png", imgDes: "Gold Medal Image", ranking: new MatTableDataSource(results.medallas) },
          { tabName: "Silver Medals", cardText: "Top silver medals", img: "assets/images/silverMedal.png", imgDes: "Silver Medal Image", ranking: new MatTableDataSource(results.medallasPlata) },
          { tabName: "Bronze Medals", cardText: "Top bronze medals", img: "assets/images/bronzeMedal.png", imgDes: "Bronze Medal Image", ranking: new MatTableDataSource(results.medallasBronce) },
          { tabName: "Gold Trophies", cardText: "Top gold trophies", img: "assets/images/trophy.png", imgDes: "Gold Trophy Image", ranking: new MatTableDataSource(results.trofeos) },
          { tabName: "Silver Trophies", cardText: "Top silver trophies", img: "assets/images/silverTrophy.png", imgDes: "Silver Trophy Image", ranking: new MatTableDataSource(results.trofeosPlata) },
          { tabName: "Bronze Trophies", cardText: "Top bronze trophies", img: "assets/images/bronzeTrophy.png", imgDes: "Bronze Trophy Image", ranking: new MatTableDataSource(results.trofeosBronce) },
          { tabName: "Infinite Score", cardText: "Top infinite score", img: "assets/images/infinite.png", imgDes: "Infinite Score Image", ranking: new MatTableDataSource(results.infinites) },
          { tabName: "Mix Scores", cardText: "Top Mix score", img: "assets/images/mix.png", imgDes: "Mix Image", ranking: new MatTableDataSource(results.mix) }
        ];

        // Asignar el paginador a cada tabla
        this.paginators.changes.subscribe(() => {
          this.rankings.forEach((ranking, index) => {
            ranking.ranking.paginator = this.paginators.toArray()[index];
          });
        });
      }
    });
  }

  // Filtro por nombre
  applyFilter(event: Event, ranking: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    ranking.filter = filterValue.trim().toLowerCase();

    if (ranking.paginator) {
      ranking.paginator.firstPage();
    }
  }
}
