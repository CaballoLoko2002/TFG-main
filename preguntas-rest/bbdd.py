import json
from bson.json_util import dumps
from pymongo import MongoClient
from bson.objectid import ObjectId

from model.pregunta import Pregunta
from model.juego import Juego

############ FUNCIONES AUXILIARES ############

def parteJsonToPregunta(json) ->Pregunta:
    pregunta=Pregunta(json['_id'],json['enunciado'], json['solucion'], json['pais'],json['categoria'],json['informacion'],json['image'])
    return pregunta

def parseJsonToGame(json) -> Juego:
    juego =Juego(json['_id'],json['nombre'],json['code'],json['status'])
    return juego



############ CLASE BBDD ############
class DataBase:
    def __init__(self) -> None:
        # establish connex
        conn = MongoClient("mongodb+srv://davidanton:david@cluster0.e000g1u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        #conn = MongoClient("localhost",27017)
        # connect db
        #self.db = conn.test
        self.db=conn.Juego
        self.collection=self.db.Pregunta
      

    def registrarPregunta(self,enunciado, solucion,pais, categoria,informacion) :
   
        aInsertar = {
            "enunciado":enunciado,
            "solucion":solucion,
            "pais":pais,
            "categoria":categoria,
            "image":"",
            "informacion":informacion
     
        }
        result = self.collection.insert_one(aInsertar)
        return result.inserted_id

    def getPreguntaById(self, id) -> json:

        jd = self.collection.find_one({ "_id": ObjectId(id) })
        json_data = json.loads(dumps(jd))
        if(len(json_data)==0):
            return None
        return json_data
    
    def getPreguntasPorCategorias(self,temas):
        

        consulta = [
    { '$match': { '$or': [
        {'pais': pais, 'categoria': categoria}
        for pais, categorias in temas.items()
        for categoria, activada in categorias.items() if activada
    ] } },
    { '$sample': { 'size': 1 } }
]
        documentos_filtrados = self.collection.aggregate(consulta).next()
        json_data=json.loads(dumps(documentos_filtrados))

        return parteJsonToPregunta(json_data)
    
    def getAllPreguntas(self):
        toReturn = []
        lista = list(self.collection.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parteJsonToPregunta(objeto))
        return toReturn

    def removeById(self, id):
        myquery = { "_id": { "$eq": ObjectId(id) } }
        self.collection.find_one_and_delete(myquery)

    def updateById(self,id, pregunta):
        myquery = { "_id": { "$eq": ObjectId(id) } }
        self.collection.update_one(myquery, pregunta)

    def updateImagen(self, id, image):
        myquery={"_id":{"$eq":ObjectId(id)}}
        updt={"$set":{"image": image}}
        self.collection.find_one_and_update(myquery,updt)

    def getPreguntaByCategorias(self, lista):
        toReturn = []
        for i in lista:
            myquery = { "categoria": { "$eq": i } }
            list = self.collection.find(myquery)
            for j in list:
                toReturn.append(j)
        return toReturn
    
    def deletePregunta(self,id):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        self.collection.find_one_and_delete(myquery)

    def editarPregunta(self,id,enunciado,solucion,pais,categoria,informacion):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        updt={"$set":{"enunciado":enunciado,
                      "solucion":solucion,
                      "pais":pais,
                      "categoria":categoria,
                      "informacion":informacion}}
       
        self.collection.find_one_and_update(myquery, updt)

    def crearTemas(self):
        aInsertar = {
            "UK":{
            "Geography": False,
            "History": False,
            "Society": False,
            "General Knowledge":False,
            "Mix": False
        },

        "USA":{
            "Geography": False,
            "History": False,
            "Society": False,
            "General Knowledge":False,
            "Mix": False
        }
     
        }
        result = self.db.Temas.insert_one(aInsertar)

    def getTemas(self):
        jd = self.db.Temas.find()
        json_data = json.loads(dumps(jd))
        return json_data[0]
    
    def updateTemas(self,UK,USA):
       updt={"$set":{"UK":UK,
                     "USA":USA}}
       
       self.db.Temas.update_one({},updt)

    def crearJuego(self,nombre,preguntas,code):
        aInsertar={
            "nombre": nombre,
            "preguntas": preguntas,
            "code":code,
            "status":"Opened"
        }

        result = self.db.Juegos.insert_one(aInsertar)

    def getGameById(self,id):
        jd = self.db.Juegos.find_one({ "_id": ObjectId(id) })
        json_data = json.loads(dumps(jd))
        if(len(json_data)==0):
            return None
        return json_data
    
    def getGameByCode(self,code):
        myquery={"code": {"$eq": code}}
        jd = self.db.Juegos.find_one(myquery)
        json_data = json.loads(dumps(jd))
        return json_data

    def getGames(self):
        toReturn = []
        lista = list(self.db.Juegos.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parseJsonToGame(objeto))
        return toReturn
    
    def updateGame(self,id,nombre,status):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        updt={"$set":{"nombre":nombre,
                      "status":status,}}
       
        self.db.Juegos.find_one_and_update(myquery, updt)

    def deleteGame(self,id):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        self.db.Juegos.find_one_and_delete(myquery)

    def getQuestionsGame(self,id):
        juego= self.getGameById(id)
        objetos_ids = [ObjectId(id) for id in juego['preguntas']]
        filtro = { "_id": { "$in": objetos_ids } }
        lista = list(self.collection.find(filtro))
        toReturn=[]
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parteJsonToPregunta(objeto))
        return toReturn
    
    def getQuestionsGameByCode(self,code):
        juego= self.getGameByCode(code)
        objetos_ids = [ObjectId(id) for id in juego['preguntas']]
        filtro = { "_id": { "$in": objetos_ids } }
        lista = list(self.collection.find(filtro))
        toReturn=[]
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parteJsonToPregunta(objeto))
        return toReturn
    
    

    def getQuestionsSinglePlayer(self,pais,categoria):
        condicion1={"pais":pais}
        condicion2={"categoria":categoria}

        resultados= list(self.collection.aggregate([
            {"$match": {"$and":[condicion1,condicion2]}},
            {"$sample":{"size":10}}
        ]))

        toReturn=[]
        json_data = dumps(resultados)
        for objeto in json.loads(json_data):
            toReturn.append(parteJsonToPregunta(objeto))
        return toReturn
    


    
