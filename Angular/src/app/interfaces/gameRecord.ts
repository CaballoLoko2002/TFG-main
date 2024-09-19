export interface GameRecord{
    _id?: {$oid:string},
    userId?: string,
    correctAnswers: number,
    incorrectAnswers: number,
    answers: {
        question: string,
        correctAnswer:string,
        answer:string
    }[]
    gameMode: string;
    score:number;
    fecha?:string
    country?:string;
    topic?:string;
    place?:number;
    top?:any[];


}