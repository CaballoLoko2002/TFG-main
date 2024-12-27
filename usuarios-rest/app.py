
from os import getcwd
import os
import random
import json
from flask import Flask, Response, flash, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from mail import enviarCorreoRegistro, enviarCorreoPassword
from modelo.user import User
from modelo.estadistica import Estadistica
import uuid as uuid;
from flask_bcrypt import Bcrypt


from bbdd import DataBase

UPLOAD_FOLDER = getcwd() + '/images/'
ALLOWED_EXTENSIONS={'jpg','jpeg','png'}

app = Flask(__name__) #aquí creamos una nueva instancia del servidor Flask.
bcrypt = Bcrypt(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
baseDatos = DataBase()
listAlumnos = []
diccionario = {}



@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "https://caballoloko2002.github.io"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, enctype, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

#################### FUNCIONES AUXILIARES ####################

def comprobarLogin(correo, contrasena) -> User:
    try:
        user = baseDatos.getUserByMail(correo)
        if user is not None and bcrypt.check_password_hash(user.password, contrasena):
            return user
    except Exception as e:
        # Registrar error para depuración
        print(f"Error comprobando login: {str(e)}")
    return None



def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS




#################### COMIENZO API ####################

@app.route("/")
def index():
    return "<h1>Hello World!</h1>"



@app.route("/login", methods=['POST']) 
def login():
    try:
        jon = json.loads(request.data)
        mail = jon.get("mail")
        password = jon.get("contrasena")

        if mail is None or password is None:
            return jsonify({"error": "Faltan campos requeridos"}), 400

        user = comprobarLogin(mail, password)
        if user is not None:
            contenido = user.to_dict()
            return jsonify(contenido), 200
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401
    except ValueError as e:
        return jsonify({"error": "JSON inválido"}), 400
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500


@app.route("/comprobarCorreo",methods=['POST'])
def comprobarRegistro():
    jon=json.loads(request.data)
    correo=jon["correo"]

    for user in baseDatos.getAllUsers():
        if(user.mail == correo):
            return Response(status=404)
    return Response(status=200)

@app.route("/comprobarCodigo",methods=['POST'])
def comprobarCodigo():
    jon=json.loads(request.data)
    email=jon["email"]
    code=jon["code"]
    if(diccionario.get(email)==int(code)):
        return Response(status=200)
    return Response(status=404)
    


@app.route("/alumno", methods=['POST']) 
def registro():
    jon = json.loads(request.data)
    mail = jon["mail"]
    password = jon["passw"]
    name = jon["name"]
    lastname=jon["lastname"]
    baseDatos.registrarAlumno(mail,password,name,lastname)
    print("registroOK")
    return Response(status=200)

@app.route("/mensaje", methods=['POST'])
def sendMail():
    jon = json.loads(request.data)
    destinatario = jon["email"]
    foo = random.SystemRandom()
    code = foo.randint(10000,100000)
    enviarCorreoRegistro(destinatario,code)
    diccionario.update({destinatario:code})
    return Response(status=200)

@app.route("/usuarios/mensajeContra", methods=['POST'])
def sendMailContrasena():
    jon=json.loads(request.data)
    destinatario = jon["email"]
    for user in baseDatos.getAllUsers():
        if(user.mail == destinatario):
            foo = random.SystemRandom()
            code = foo.randint(10000,100000)
            enviarCorreoPassword(destinatario,code)
            diccionario.update({destinatario:code})    
    
    
    return Response(status=200)


@app.route("/usuarios/chngPsswrd", methods=['POST'])
def cambioContrasena():
    try:
        jon = json.loads(request.data)
        mail = jon.get("email")
        contra = jon.get("pass")

        if mail is None or contra is None:
            return jsonify({"error": "Faltan campos requeridos"}), 400

        baseDatos.updatePassword(mail, contra)
        return jsonify({"resultado": "Contraseña actualizada"}), 200
    except ValueError:
        return jsonify({"error": "JSON inválido"}), 400
    except Exception as e:
        print(f"Error cambiando contraseña: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500



@app.route("/usuarios/<id>", methods=['GET'])
def getUser(id):
    try:
        user = baseDatos.getUserById(id)
        if user is None:
            return jsonify({"error": "Usuario no encontrado"}), 404
        contenido = user.to_dict()
        return jsonify(contenido), 200
    except Exception as e:
        print(f"Error obteniendo usuario {id}: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500



@app.route("/usuarios", methods=['GET'])
def getAllUser():
    lista = baseDatos.getAllUsers()
    listaJson = []
    for user in lista:
        doc = user.to_dict()
        listaJson.append(doc)

    
    response = jsonify(listaJson)
    response.status_code = 200
    return response

@app.route("/usuarios/alumnos",methods=['GET'])
def getAllAlumnos():
    lista=baseDatos.getAllAlumnos()
    listaJson=[]
    for alumno in lista: 
        doc=alumno.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code=200
    return response

@app.route("/usuarios/<id>", methods=['DELETE'])
def rmvAlumno(id):
    baseDatos.deleteUser(id)
    return Response(status=200)


@app.route("/usuarios/getTemas", methods=['POST'])
def getTemas():
    jon = json.loads(request.data)
    mail = jon["mail"]
    profesor = baseDatos.getUserByMail(mail)
    contenido = {
        "resultado" : "OK",
        "temas" : profesor.temas
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/aluToProf", methods=['PUT'])
def aluToProf():
    jon = json.loads(request.data)
    mail = jon["correo"]
    baseDatos.aluToProf(mail)
    return Response(status=200)


@app.route("/usuarios/temasDisponibles", methods=['GET'])
def getAllTemas():
    toReturn = []
    profesores = baseDatos.getAllProfesores()
    for p in profesores:
        profesor = baseDatos.getUserByMail(p["mail"])
        temas = profesor.temas
        for t in temas:
            if(temas.get(t) and not toReturn.__contains__(t)):
                toReturn.append(t)
    contenido = {
        "resultado" : "OK",
        "temas" : toReturn
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response


@app.route("/usuarios/top", methods=['GET'])
def getusersTop():
    medallas = list(baseDatos.getTopMedallas())
    medallasPlata = list(baseDatos.getTopMedallasSilver())
    medallasBronce = list(baseDatos.getTopMedallasBronce())
    trofeos = list(baseDatos.getTopTrofeos())
    infins = list(baseDatos.getTopInfinites())
    mix = list(baseDatos.getTopMix())  # NUEVO: ranking de Mix
    trofeosPlata = list(baseDatos.getTopTrofeosPlata())
    trofeosBronce = list(baseDatos.getTopTrofeosBronce())

    # Añadir índices a cada ranking
    for i, item in enumerate(medallas, 1):
        item['ind'] = i
    for i, item in enumerate(medallasPlata, 1):
        item['ind'] = i
    for i, item in enumerate(medallasBronce, 1):
        item['ind'] = i
    for i, item in enumerate(trofeos, 1):
        item['ind'] = i
    for i, item in enumerate(trofeosPlata, 1):
        item['ind'] = i
    for i, item in enumerate(trofeosBronce, 1):
        item['ind'] = i
    for i, item in enumerate(infins, 1):
        item['ind'] = i
    for i, item in enumerate(mix, 1):  # Añadir índices para Mix
        item['ind'] = i

    contenido = {
        "resultado": "OK",
        "medallas": medallas,
        "medallasPlata": medallasPlata,
        "medallasBronce": medallasBronce,
        "trofeos": trofeos,
        "trofeosPlata": trofeosPlata,
        "trofeosBronce": trofeosBronce,
        "infinites": infins,
        "mix": mix  # NUEVO: se incluye el ranking Mix
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response


@app.route("/usuarios/<id>/records", methods=['POST'])
def saveGameRecord(id):
    jon = json.loads(request.data)

    resultado = jon['correctAnswers']
    modo = jon['gameMode']
    # Obtenemos el topic de forma segura, si no existe, topic será None
    topic = jon.get('topic', None)

    if modo == 'Classroom Challenge':
        place = jon['place']
    elif modo == 'Battlemode':
        place = jon['place']
        print(place)
    else:
        place = -1
    

    # Aquí pasamos también el topic (si está presente)
    addTrophy(id, resultado, modo, place, topic)
    
    # Guardar el historial del juego
    baseDatos.saveRegistroPartida(id, jon)
    
    return Response(status=200)



def addTrophy(userId, resultado, modo, place, topic):
    alumno = baseDatos.getUserById(userId)
    v = alumno.vitrina
    if modo == 'Single Player Mode':
        if topic == 'Mix':
            if resultado > v.get('recordMix', 0):
                v['recordMix'] = resultado
        else:
            if resultado < 9 and resultado >= 7:
                v['medallaBronce'] = v.get('medallaBronce', 0) + 1
            elif resultado == 9:
                v['medallaPlata'] = v.get('medallaPlata', 0) + 1
            elif resultado == 10:
                v['medallaOro'] = v.get('medallaOro', 0) + 1
        alumno.single_player += 1
    elif modo == 'Battlemode':
        alumno.battlemode += 1
        if place == 0:  
            v['victoriasBattleMode'] = v.get('victoriasBattleMode', 0) + 1
    elif modo == 'Classroom Challenge':
        if place == 0:
            v['trofeoOro'] = v.get('trofeoOro', 0) + 1
        elif place == 1:
            v['trofeoPlata'] = v.get('trofeoPlata', 0) + 1
        elif place == 2:
            v['trofeoBronce'] = v.get('trofeoBronce', 0) + 1
        alumno.classroom_challenge += 1
    elif modo == 'Infinite Mode':
        alumno.infinite_mode += 1
        if modo == 'Infinite Mode' and resultado > v.get('recordInfinito', 0):
            v['recordInfinito'] = resultado

    

    v['numPartidas'] = v.get('numPartidas', 0) + 1
    baseDatos.actualizarVitrina(userId, v)
    baseDatos.updateUserStats(userId, alumno.to_dict())




#ACTUALIZAR FOTOS
@app.route("/usuarios/<id>", methods=['POST'])
def uploadFotoPerfil(id):
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No se ha enviado ningún archivo"}), 400
        
        file = request.files['files']
        
        if file.filename == '':
            return jsonify({"error": "No se ha seleccionado ningún archivo"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Formato de archivo no permitido"}), 400

        filename = secure_filename(file.filename)
        nombre_archivo = str(uuid.uuid1()) + "_" + filename

        # Guardar archivo y actualizar imagen en la base de datos
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], nombre_archivo))
        baseDatos.updateProfileImage(id, nombre_archivo)
        
        contenido = {"image": nombre_archivo}
        return jsonify(contenido), 200
    except Exception as e:
        print(f"Error subiendo archivo para usuario {id}: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500


    
    
@app.route('/imagen/<filename>')
def imagenRequest(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename, as_attachment=True,mimetype='image/jpg')

@app.route("/estadisticas/actualiza_partida", methods=['GET'])
def actualiza_partida():
    # Obtener y validar los parámetros
    modo = request.args.get('modo')
    respuestas_correctas = request.args.get('respuestasCorrectas', type=int)
    respuestas_incorrectas = request.args.get('respuestasIncorrectas', type=int)

    if not modo or respuestas_correctas is None or respuestas_incorrectas is None:
        return jsonify({"error": "Faltan parámetros"}), 400
    
    # Obtener instancia de Estadistica
    estadistica = Estadistica.cargar_desde_base_datos(baseDatos.db)  # Asegura que siempre carga la última versión
    
    # Actualizar partida
    estadistica.actualiza_partida(modo, respuestas_correctas, respuestas_incorrectas)
    estadistica.guardar_en_base_datos(baseDatos.db)  # Guardar tras cada modificación

    # Respuesta
    return jsonify({"resultado": "Partida actualizada correctamente", "estadisticas": estadistica.to_dict()}), 200


@app.route("/estadisticas/actualiza_partida_online", methods=['GET'])
def actualiza_partida_online():
    # Obtenemos los parámetros de la URL
    modo = request.args.get('modo')
    
    # Validamos que los parámetros no sean nulos
    if not modo:
        return jsonify({"error": "Faltan parámetros. Se requieren 'modo'."}), 400

    # Obtenemos la única instancia de Estadistica (Singleton)
    estadistica = Estadistica()

    # Actualizamos la partida
    estadistica.actualiza_partida_juegoonline(modo)

    # Guardamos las estadísticas en la base de datos
    estadistica.guardar_en_base_datos(baseDatos.db)

    # Devolvemos una respuesta indicando éxito
    return jsonify({"resultado": "Partida actualizada correctamente", "estadisticas": estadistica.to_dict()}), 200

@app.route("/estadisticas/actualiza_pregunta_online", methods=['GET'])
def actualiza_pregunta_online():
    # Obtenemos los parámetros de la URL
    modo = request.args.get('modo')
    respuestas_correctas = request.args.get('respuestasCorrectas', type=int)
    respuestas_incorrectas = request.args.get('respuestasIncorrectas', type=int)


    # Validamos que los parámetros no sean nulos
    if not modo or respuestas_correctas is None or respuestas_incorrectas is None or not id:
        return jsonify({"error": "Faltan parámetros. Se requieren 'modo', 'respuestasCorrectas', 'respuestasIncorrectas' y 'id'."}), 400
    
    # Obtenemos la única instancia de Estadistica (Singleton)
    estadistica = Estadistica()

    # Actualizamos la partida
    estadistica.actualiza_pregunta_juegoonline(modo, respuestas_correctas, respuestas_incorrectas)

    # Guardamos las estadísticas en la base de datos
    estadistica.guardar_en_base_datos(baseDatos.db)

    # Devolvemos una respuesta indicando éxito
    return jsonify({"resultado": "Partida actualizada correctamente", "estadisticas": estadistica.to_dict()}), 200

@app.route("/estadisticas", methods=['GET'])
def obtener_estadisticas():
    # Obtener la única instancia de Estadistica (Singleton)
    estadistica = Estadistica.cargar_desde_base_datos(baseDatos.db)

    # Devolver las estadísticas en formato JSON
    return jsonify({
        "resultado": "OK",
        "estadisticas": estadistica.to_dict()
    }), 200

@app.after_request
def save_estadistica_on_update(response):
    estadistica = Estadistica()
    estadistica.guardar_en_base_datos(baseDatos.db)  # Guarda los datos tras cada petición
    return response


if __name__ == '__main__':
    from waitress import serve
    #app.run(ssl_context=('/var/servers/servicioSidra/certificados2020Node/docentis_inf_um_es.crt', '/var/servers/servicioSidra/certificados2020Node/mydomain.key'), host='0.0.0.0',port=8384)
    app.run(host='127.0.0.1',port=8384,debug=True)
