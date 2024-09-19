import { GameRecord } from "./gameRecord";
import { Vitrina } from "./vitrina";


export interface User {
    _id: string;
    rol: string
    correo: string;
    nombre: string;
    lastname:string;
    vitrina?: Vitrina;
    image?:string;
    history?:GameRecord[]
}
