export interface Question {
    _id: string;
    question:string;
    answer: string;
    country: string;
    topic: string;
    image?:string;
    information?:string;
   
}