import { Component, OnInit } from '@angular/core';
import { GameRecord } from 'src/app/interfaces/gameRecord';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-game-record-detail',
  templateUrl: './game-record-detail.component.html',
  styleUrls: ['./game-record-detail.component.css']
})
export class GameRecordDetailComponent implements OnInit{

  gameRecord: GameRecord;
  index: number = 1;
  modo: string = 'Questions';

  constructor(private userService: UserService, private location: Location) { }

  ngOnInit() {
    this.gameRecord = this.userService.getRecord();
  }

  cambioModo(modo: string) {
    this.modo = modo;
  }

  goBack(): void {
    this.location.back();
  }

  downloadAnswers() {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(16);
    doc.text('Game Record - Questions and Answers', 10, 10);

    // Agregar detalles sobre el juego
    doc.setFontSize(12);
    doc.text(`Game Mode: ${this.gameRecord.gameMode}`, 10, 20);
    doc.text(`Played On: ${new Date(this.gameRecord.fecha || '').toLocaleString()}`, 10, 30);
    doc.text(`Score: ${this.gameRecord.score}`, 10, 40);
    doc.text(`Country: ${this.gameRecord.country}`, 10, 50);
    doc.text(`Topic: ${this.gameRecord.topic}`, 10, 60);

    // Crear tabla de preguntas y respuestas
    const questions = this.gameRecord.answers.map((question, index) => [
      index + 1,
      question.question,
      question.correctAnswer,
      question.answer ? question.answer : 'N/A'
    ]);

    // Agregar tabla con autoTable (nombre de columna: #, Pregunta, Respuesta Correcta, Tu Respuesta)
    (doc as any).autoTable({
      head: [['#', 'Question', 'Correct Answer', 'Your Answer']],
      body: questions,
      startY: 70,
    });

    // Descargar el PDF con el nombre "game-record.pdf"
    doc.save('game-record.pdf');
  }
}
