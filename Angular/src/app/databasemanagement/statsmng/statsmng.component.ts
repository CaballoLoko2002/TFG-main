import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatTable } from '@angular/material/table';  // Importar MatTable

interface EstadisticasTabla {
  mode: string;
  gamesPlayed: number;
  correct: number;
  incorrect: number;
  total: number;
  correctPercentage: number;
  incorrectPercentage: number;
}

@Component({
  selector: 'app-statsmng',
  templateUrl: './statsmng.component.html',
  styleUrls: ['./statsmng.component.css']
})
export class StatsmngComponent implements OnInit {
  estadisticas: any = null;
  displayedColumns: string[] = ['Mode', 'Games Played', 'Correct', 'Incorrect', 'Total', 'Correct %', 'Incorrect %'];
  dataSource: EstadisticasTabla[] = [];

  @ViewChild(MatTable) table!: MatTable<any>;  // Añadir referencia a la tabla

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getEstadisticas().subscribe(data => {
      console.log('Estadisitica:', data);
      this.estadisticas = data.estadisticas;
      this.setTableData();
    });
  }

  setTableData(): void {
    if (this.estadisticas) {
      this.dataSource = [
        {
          mode: 'Classroom Challenge',
          gamesPlayed: this.estadisticas.partidas_classroom,
          correct: this.estadisticas.preguntas_classroom_acertadas,
          incorrect: this.estadisticas.preguntas_classroom_falladas,
          total: this.estadisticas.preguntas_classroom_acertadas + this.estadisticas.preguntas_classroom_falladas,
          correctPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_classroom_acertadas, this.estadisticas.preguntas_classroom_acertadas + this.estadisticas.preguntas_classroom_falladas),
          incorrectPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_classroom_falladas, this.estadisticas.preguntas_classroom_acertadas + this.estadisticas.preguntas_classroom_falladas)
        },
        {
          mode: 'Battle Mode',
          gamesPlayed: this.estadisticas.partidas_battlemode,
          correct: this.estadisticas.preguntas_battlemode_acertadas,
          incorrect: this.estadisticas.preguntas_battlemode_falladas,
          total: this.estadisticas.preguntas_battlemode_acertadas + this.estadisticas.preguntas_battlemode_falladas,
          correctPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_battlemode_acertadas, this.estadisticas.preguntas_battlemode_acertadas + this.estadisticas.preguntas_battlemode_falladas),
          incorrectPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_battlemode_falladas, this.estadisticas.preguntas_battlemode_acertadas + this.estadisticas.preguntas_battlemode_falladas)
        },
        {
          mode: 'Single Player',
          gamesPlayed: this.estadisticas.partidas_singleplayer,
          correct: this.estadisticas.preguntas_singleplayer_acertadas,
          incorrect: this.estadisticas.preguntas_singleplayer_falladas,
          total: this.estadisticas.preguntas_singleplayer_acertadas + this.estadisticas.preguntas_singleplayer_falladas,
          correctPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_singleplayer_acertadas, this.estadisticas.preguntas_singleplayer_acertadas + this.estadisticas.preguntas_singleplayer_falladas),
          incorrectPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_singleplayer_falladas, this.estadisticas.preguntas_singleplayer_acertadas + this.estadisticas.preguntas_singleplayer_falladas)
        },
        {
          mode: 'Infinity Mode',
          gamesPlayed: this.estadisticas.partidas_infinity_mode,
          correct: this.estadisticas.preguntas_infinity_mode_acertadas,
          incorrect: this.estadisticas.preguntas_infinity_mode_falladas,
          total: this.estadisticas.preguntas_infinity_mode_acertadas + this.estadisticas.preguntas_infinity_mode_falladas,
          correctPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_infinity_mode_acertadas, this.estadisticas.preguntas_infinity_mode_acertadas + this.estadisticas.preguntas_infinity_mode_falladas),
          incorrectPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_infinity_mode_falladas, this.estadisticas.preguntas_infinity_mode_acertadas + this.estadisticas.preguntas_infinity_mode_falladas)
        },
        {
          mode: 'Total',
          gamesPlayed: this.estadisticas.partidas_jugadas,
          correct: this.estadisticas.preguntas_acertadas,
          incorrect: this.estadisticas.preguntas_falladas,
          total: this.estadisticas.preguntas_totales,
          correctPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_acertadas, this.estadisticas.preguntas_totales),
          incorrectPercentage: this.calcularPorcentaje(this.estadisticas.preguntas_falladas, this.estadisticas.preguntas_totales)
        },
      ];
      this.table.renderRows();  // Forzar el renderizado de las filas de la tabla
    }
  }
  
  calcularPorcentaje(parte: number, total: number): number {
    return total > 0 ? (parte / total) * 100 : 0;
  }
}
