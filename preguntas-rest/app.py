import base64
import json
import random
from os import getcwd, remove
import codecs
import os
import random
import uuid
from flask import Flask, Blueprint, Response, flash, request, jsonify, send_from_directory

from flask_socketio import SocketIO,join_room, leave_room,send, emit
from model.room import Room
from werkzeug.utils import secure_filename
from model.pregunta import Pregunta
from bson.json_util import dumps

from bbdd import DataBase



rooms={}
UPLOAD_FOLDER = getcwd() + '/images/'
ALLOWED_EXTENSIONS={'jpg','jpeg','png','webp'}



app = Flask(__name__) #aquí creamos una nueva instancia del servidor Flask.
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app,cors_allowed_origins="*",async_handlers=True)



baseDatos = DataBase()

routes_files = Blueprint("routes_files", __name__)



dicCategory = {
    1 : "UK General knowledge",
    2 : "UK Geography",
    3 : "UK History",
    4 : "UK Society",
    5 : "UK Mix",
    6 : "USA General knowledge",
    7 : "USA Geography",
    8 : "USA History",
    9 : "USA Society",
    10 : "USA Mix"
}

#################### FUNCIONES AUXILIARES ####################

@app.route("/")
def index():
    return "<h1>Hello World!</h1>"
	
@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization,enctype"
    return response


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_foto(file,idPregunta):

    if file.filename =='':
        flash('No selected file')
        return Response(status=400)
    
    if file and allowed_file(file.filename):
        filename=secure_filename(file.filename)
        #Evitamos nombres repetidos
        nombre_archivo= str(uuid.uuid1())+"_"+filename

        #Eliminamos la foto antigua, para ello obtenemos su nombre primero 
        delete_foto(idPregunta)
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],nombre_archivo))
        baseDatos.updateImagen(idPregunta,nombre_archivo)
        return nombre_archivo

def delete_foto(idPregunta):

    question=baseDatos.getPreguntaById(idPregunta)
    if(question['image']!=""):
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'],question['image']))


#################### COMIENZO API ####################

@app.route("/preguntas", methods=['POST']) 
def register():
    enunciado = request.form["question"]
    solucion = request.form["answer"]
    pais= request.form["country"]
    categoria = request.form["topic"]
    informacion=request.form.get('information', '')
    


    idPregunta = baseDatos.registrarPregunta(enunciado, solucion,pais, categoria,informacion)
    if 'files' in request.files:
        file= request.files['files']
        upload_foto(file,idPregunta)


    return Response(status=200)

@app.route("/preguntas/registerFile", methods=['POST']) 
def register_from_file():

    numPreguntas=0
    uploaded_file = request.files['fileTxt']
    if uploaded_file.filename != '':
        uploaded_file.save(uploaded_file.filename)
        with codecs.open(uploaded_file.filename, mode='r', encoding='iso-8859-1') as f:
            cadena = repr(f.read().replace("\x96", "-").replace("\x92", "\"").replace("\x91", "\"").replace("\x85","...").replace("\x97","-")).split("\\r\\n")
            for i in cadena:
                c = i.split("¡")
                if c.__len__() == 3:
                    q = c[0]
                    r = c[1]
                    k = c[2]
                    baseDatos.registrarPregunta(q,r,dicCategory.get(int(k)),"null")
                    numPreguntas=numPreguntas+1
        remove(uploaded_file.filename)

    contenido = {
        "resultado":"OK",
        "numPreguntas":numPreguntas.__str__()
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response
        

@app.route("/preguntas/una", methods=['POST']) 
def getPregunta():
    jon = json.loads(request.data)
    temas = jon['temas']

    preguntas = baseDatos.getPreguntasPorCategorias(temas)
    preg = random.choice(preguntas)

    contenido = {
        "resultado":"OK",
        "enunciado": preg["enunciado"],
        "solucion" : base64.b64encode(bytes(preg["solucion"], encoding = "latin-1")).__str__(),
        "image" : preg["image"]
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

@app.route("/preguntas", methods=['GET']) 
def getPreguntas():

    preguntas = baseDatos.getAllPreguntas()
    listaJson=[]
    for pregunta in preguntas:
        doc= pregunta.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response


@app.route("/preguntas/<id>", methods=['DELETE'])
def deletePregunta(id):
    baseDatos.deletePregunta(id)
    return Response(status=200)

@app.route("/preguntas/<id>",methods=['PUT'])
def editPregunta(id):

    enunciado = request.form["question"]
    solucion = request.form["answer"]
    pais = request.form["country"]
    categoria = request.form["topic"]
    informacion = request.form.get('information', '')
    
    # Si se ha subido un nuevo archivo, lo procesamos
    if 'files' in request.files:
        file = request.files['files']
        image = upload_foto(file, id)
    else:
        # Solo eliminamos la foto si el frontend ha enviado una indicación clara de que la foto debe ser eliminada
        if request.form.get('delete_image', 'false') == 'true':
            delete_foto(id)
            baseDatos.updateImagen(id, "")
        else:
            # Si no se sube ninguna imagen nueva y no se ha indicado eliminar la imagen, mantenemos la imagen anterior.
            image = baseDatos.getPreguntaById(id)['image']
            baseDatos.updateImagen(id, image)

    baseDatos.editarPregunta(id, enunciado, solucion, pais, categoria, informacion)

    return Response(status=200)



@app.route("/preguntas/infinite",methods=['GET'])
def getPreguntaInfinite():
    temas=baseDatos.getTemas()
    pregunta=baseDatos.getPreguntasPorCategorias(temas)
    response=jsonify(pregunta.to_dict())
    response.status_code=200
    return response


@app.route("/temas",methods=['POST'])
def crearTemas():
    baseDatos.crearTemas()
    return Response(status=200)

@app.route("/temas",methods=['GET'])
def getTemas():
    contenido=baseDatos.getTemas()
    contenido_response={
        "UK": contenido['UK'],
        "USA":contenido['USA']
    }
    response = jsonify(contenido_response)
    response.status_code = 200
    return response

@app.route("/temas",methods=['PUT'])
def updateTemas():
    jon = json.loads(request.data)
    UK = jon["UK"]
    USA = jon["USA"]
    baseDatos.updateTemas(UK,USA)
    return Response(status=200)

@app.route("/games",methods=['POST'])
def crearGame():
    jon = json.loads(request.data)
    nombre = jon["nombre"]
    preguntas = jon["preguntas"]
    foo = random.SystemRandom()
    code = foo.randint(10000,100000)
    baseDatos.crearJuego(nombre,preguntas,code)
    return Response(status=200)

@app.route("/games",methods=['GET'])
def getGames():
    games=baseDatos.getGames()
    listaJson=[]
    for game in games:
        doc= game.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response

@app.route("/games",methods=['PUT'])
def updateGame():
    jon= json.loads(request.data)
    id = jon["_id"]
    nombre= jon["name"]
    status= jon["status"]
    baseDatos.updateGame(id,nombre,status)
    return Response(status=200)

@app.route("/games/<id>",methods=['DELETE'])
def deleteGame(id):
    baseDatos.deleteGame(id)
    return Response(status=200)

@app.route("/games/<id>/preguntas",methods=['GET'])
def getPreguntasGame(id):
    preguntas= baseDatos.getQuestionsGame(id)
    listaJson=[]
    for pregunta in preguntas:
        doc= pregunta.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response

@app.route("/preguntas/singleplayer", methods=['GET'])
def getPreguntasSinglePlayer():
    pais = request.args.get('pais')
    categoria = request.args.get('categoria')

    # Si la categoría es "Mix", obtenemos todas las preguntas del país
    if categoria == "Mix" or categoria is None:
        preguntas = baseDatos.getPreguntasPorPais(pais)
    else:
        preguntas = baseDatos.getQuestionsSinglePlayer(pais, categoria)

    listaJson = []
    for pregunta in preguntas:
        doc = pregunta.to_dict()
        listaJson.append(doc)

    response = jsonify(listaJson)
    response.status_code = 200
    return response


@app.route("/preguntas/battlemode", methods=['GET'])
def getPreguntasBattleMode():
    pais = request.args.get('pais')
    categoria = request.args.get('categoria')
    maximo = request.args.get('maximo')

    # Si la categoría es "Mix", obtenemos todas las preguntas del país
    if categoria == "Mix" or categoria is None:
        preguntas = baseDatos.getPreguntasPorPais(pais)
    else:
        preguntas = baseDatos.getQuestionsSinglePlayer(pais, categoria)

    random.shuffle(preguntas)

    listaJson = []
    listaJson = [pregunta.to_dict() for pregunta in preguntas[:int(maximo)]]


    response = jsonify(listaJson)
    response.status_code = 200
    return response



#ACTUALIZAR FOTOS
@app.route("/preguntas/<id>", methods=['POST'])
def uploadFotoPregunta(id):

    if 'files' not in request.files:
        flash('No file part')
        return Response(status=400)
    
    file= request.files['files']
    
    
    nombre_archivo= upload_foto(file)
    contenido = {
        
        "image" : nombre_archivo,
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response
    
    
@app.route('/imagen/<filename>')
def imagenRequest(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename, as_attachment=True,mimetype='image/jpg')



#SOCKET
@socketio.on('crearSala')
def handle_message(data,gameCode):
    print('received message:' + data)

    game= baseDatos.getGameByCode(int(gameCode))
    if (game is not None) and game["status"]=="Opened":
        print("eoeoeooeoeoeoeoeoeoeo")
        foo = random.SystemRandom()
        code = foo.randint(10000,100000)
        while code in rooms:
          foo = random.SystemRandom()
          code = foo.randint(10000,100000)
    
        room= Room(code,gameCode)
        room.players.append(data)
        rooms[code]= room
        join_room(code)
        socketio.emit('detallesSala',room.to_dict(),to=code)
    
    else:
        emit('detallesSala')

@socketio.on('entrarSala')
def entrar_Sala(user,sala):

    if (int(sala) not in rooms):
        emit("detallesSala")
        return
    

    join_room(int(sala))
 
    room=rooms.get(int(sala))
    room.players.append(user)
    print(room.players)
    socketio.emit("detallesSala",room.to_dict(),to=int(sala))

@socketio.on('updateTimer')
def updateTimer(sala,timer):

    room=rooms.get(int(sala))
    room.timer=int(timer)

    socketio.emit("detallesSala",room.to_dict(),to=int(sala))



@socketio.on("empezarJuego")
def empezarJuego(sala):
    print(sala)
    room=rooms.get(int(sala))
    room.questions=baseDatos.getQuestionsGameByCode(int(room.gameCode))
    socketio.emit("preguntaJuego",room.questions[room.questionNumber].to_dict(),to=int(sala))


@socketio.on("siguientePregunta")
def siguientePregunta(sala):
    room=rooms.get(int(sala))
    room.questionNumber=room.questionNumber+1
    if(room.questionNumber>len(room.questions)-1):
        socketio.emit("preguntaJuego",to=int(sala))
    else:
        socketio.emit("preguntaJuego",room.questions[room.questionNumber].to_dict(),to=int(sala))

@socketio.on("terminarPregunta")
def mostrarResultado(sala):
    socketio.emit("mostrarResultados",to=int(sala))

@socketio.on("resultadoFinal")
def obtenerResultado(user,score,sala):
    print("RESULTADO:" +user+" ")
    print(score)
    room=rooms.get(int(sala))
    room.scoresrcv=room.scoresrcv+1
    
    room.scores[user]=int(score)
    if(len(room.players)-1==room.scoresrcv):

        diccionario_ordenado = dict(sorted(room.scores.items(),key=lambda x:x[1], reverse=True))
        primera_entrada = next(iter(diccionario_ordenado.items()))
        envio={
            "nombre": primera_entrada[0],
            "score": primera_entrada[1]
        }

        lista_jsons=[]
        for entrada, datos in diccionario_ordenado.items():
            entrada = {
                "nombre":entrada,
                "score":datos
            }
            json_individual = entrada
            lista_jsons.append(json_individual)

        socketio.emit("ganador",lista_jsons,to=int(sala))

@socketio.on("salirSala")
def salirSala(sala,user):
    room=rooms.get(int(sala))
    room.players.remove(user)
    if(len(room.players)==0):
        del rooms[int(sala)]
    socketio.emit("detallesSala",room.to_dict(),to=int(sala))

@socketio.on("salirSalaAlumno")
def salirSalaAlumno(sala,user):
    room=rooms.get(int(sala))
    room.players.remove(user)
    if(len(room.players)==0):
        del rooms[int(sala)]
    socketio.emit("detallesSalaAlumno",room.to_dict(),to=int(sala))

@socketio.on('crearSalaAlumno')
def crear_sala_alumno(user, codigo):
    if codigo in rooms:
        emit('detallesSalaAlumno', 'error')  # Si el código ya existe, enviar error
    else:
        room = Room(codigo, None)  # Creamos una sala sin código de juego específico
        room.players.append(user)
        rooms[codigo] = room
        join_room(codigo)
        emit('detallesSalaAlumno', room.to_dict(), to=codigo)

@socketio.on('entrarSalaAlumno')
def entrar_sala_alumno(user, sala):
    sala = int(sala)
    if sala not in rooms:
        print(f"Error: Sala {sala} no encontrada para el usuario {user}")
        emit('detallesSalaAlumno', 'error')  # Si la sala no existe, enviamos error
    else:
        join_room(sala)
        room = rooms.get(sala)
        room.players.append(user)
        print(f"El usuario {user} ha entrado a la sala {sala}")
        emit('detallesSalaAlumno', room.to_dict(), to=sala)


@socketio.on('enviarPreguntas')
def recibir_preguntas(data):
    sala = int(data['sala'])
    preguntas = data['preguntas']
    
    # Guardar las preguntas en la sala (para referencia futura si es necesario)
    if sala in rooms:
        room = rooms.get(sala)
        room.questions = preguntas
        room.questionNumber = 0  # Reiniciar el contador de preguntas

        # Enviar **todas las preguntas** a todos los jugadores en la sala
        socketio.emit('preguntasJuegoAlumno', preguntas, to=sala)  # Enviar el array completo
    else:
        emit('error', {'message': 'Sala no encontrada'})

@socketio.on('resultadoAlumno_battlemode')
def recibir_resultado_battlemode(user, score, sala):
    sala = int(sala)
    room = rooms.get(sala)
    
    # Verificación de la existencia de la sala
    if room is None:
        print(f"Error: Sala {sala} no encontrada para el usuario {user}")
        return  # Manejo de error: la sala no existe
    
    # Registrar el resultado del jugador
    room.scores[user] = score
    room.scoresrcv += 1  # Incrementar el contador de resultados recibidos

    # Emitir los resultados parciales a todos los jugadores en la sala
    socketio.emit('resultadosParciales_battlemode', {'user': user, 'score': score}, to=sala)

    # Si todos los jugadores han terminado, enviar los resultados finales
    if room.scoresrcv == len(room.players):
        # Convertir el diccionario de scores en una lista de objetos {nombre: user, score: score}
        resultados_finales = [{"user": nombre, "score": score} for nombre, score in room.scores.items()]

        # Emitir los resultados finales en formato de lista
        socketio.emit("mostrarResultadosFinales_battlemode", resultados_finales, to=sala)


@socketio.on('temporizador')
def recibir_temporizador(sala, timer):
    # Emitir el temporizador a todos los jugadores en la sala
    socketio.emit('actualizarTemporizador', {'tiempo': timer}, to=int(sala))



       

if __name__ == '__main__':
    from waitress import serve

   #  app.run(ssl_context=('/var/servers/servicioSidra/certificados2020Node/docentis_inf_um_es.crt', '/var/servers/servicioSidra/certificados2020Node/mydomain.key'), host='0.0.0.0',port=8384)
    app.run(host='127.0.0.1',port=8385,debug=True)

