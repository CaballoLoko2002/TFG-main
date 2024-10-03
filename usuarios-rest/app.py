
from os import getcwd
import os
import random
import json
from flask import Flask, Response, flash, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from mail import enviarCorreoRegistro, enviarCorreoPassword
from modelo.user import User
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
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, enctype, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

#################### FUNCIONES AUXILIARES ####################

def comprobarLogin(correo, contrasena) -> User:
    user = baseDatos.getUserByMail(correo)
    if(user != None and bcrypt.check_password_hash(user.password, contrasena)):
        return user
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
    jon = json.loads(request.data)
    mail = jon["mail"]
    password = jon["contrasena"]
    user = comprobarLogin(mail,password)
    if user != None:
        contenido=user.to_dict()
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        return Response(status=401)

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
    jon=json.loads(request.data)
    mail=jon["email"]
    contra=jon["pass"]
    baseDatos.updatePassword(mail,contra)
    return Response(status=200)


@app.route("/usuarios/<id>", methods=['GET'])
def getUser(id):
    user=baseDatos.getUserById(id)
    contenido=user.to_dict()
    response=jsonify(contenido)
    response.status_code=200
    return response


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
    medallasPlata=list(baseDatos.getTopMedallasSilver())
    medallasBronce=list(baseDatos.getTopMedallasBronce())
    trofeos = list(baseDatos.getTopTrofeos())
    infins = list(baseDatos.getTopInfinites())
    trofeosPlata=list(baseDatos.getTopTrofeosPlata())
    trofeosBronce=list(baseDatos.getTopTrofeosBronce())


    i=1
    for medal in medallas:
        
        medal['ind'] = i
        i +=1
        print(medal)

    i=1
    for medal in medallasPlata:
        medal['ind'] = i
        i +=1
        print(medal)

    i=1
    for medal in medallasBronce:
        medal['ind'] = i
        i +=1
        print(medal)



    i=1
    for trof in trofeos:
        trof['ind'] = i
        i +=1
    
    i=1
    for trof in trofeosPlata:
        print(trof)
        trof['ind'] = i
        i +=1

    i=1
    for trof in trofeosBronce:
        print(trof)
        trof['ind'] = i
        i +=1

    i=1
    for inf in infins:
        inf['ind'] = i
        i +=1


    contenido = {
        "resultado" : "OK",
        "medallas" : medallas,
        "medallasPlata":medallasPlata,
        "medallasBronce": medallasBronce,
        "trofeos" : trofeos,
        "trofeosPlata" : trofeosPlata,
        "trofeosBronce" : trofeosBronce,
        "infinites" : infins
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
        # Verificamos si topic es 'Mix', y actuamos en consecuencia
        if topic == 'Mix':
            # Si el topic es Mix, manejamos el récord de Mix
            if resultado > v.get('recordMix', 0):
                v['recordMix'] = resultado
        else:
            # Si no es 'Mix' o topic es None, manejamos las medallas
            if resultado < 9 and resultado >= 7:
                v['medallaBronce'] = v.get('medallaBronce', 0) + 1
            elif resultado == 9:
                v['medallaPlata'] = v.get('medallaPlata', 0) + 1
            elif resultado == 10:
                v['medallaOro'] = v.get('medallaOro', 0) + 1

    if modo == 'Classroom Challenge':
        if place == 0:
            v['trofeoOro'] = v.get('trofeoOro', 0) + 1
        elif place == 1:
            v['trofeoPlata'] = v.get('trofeoPlata', 0) + 1
        elif place == 2:
            v['trofeoBronce'] = v.get('trofeoBronce', 0) + 1

    if modo == 'Infinite Mode' and resultado > v.get('recordInfinito', 0):
        v['recordInfinito'] = resultado

    # Actualizamos el número de partidas
    v['numPartidas'] = v.get('numPartidas', 0) + 1

    # Actualizamos la vitrina en la base de datos
    baseDatos.actualizarVitrina(userId, v)




#ACTUALIZAR FOTOS
@app.route("/usuarios/<id>", methods=['POST'])
def uploadFotoPerfil(id):

    if 'files' not in request.files:
        flash('No file part')
        return Response(status=400)
    
    file= request.files['files']
    
    if file.filename =='':
        flash('No selected file')
        return Response(status=400)
    
    if file and allowed_file(file.filename):
        filename=secure_filename(file.filename)
        #Evitamos nombres repetidos
        nombre_archivo= str(uuid.uuid1())+"_"+filename

        #Eliminamos la foto antigua, para ello obtenemos su nombre primero 
        user= baseDatos.getUserById(id)
        if(user.image!=""):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'],user.image))
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],nombre_archivo))
        baseDatos.updateProfileImage(id,nombre_archivo)
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

if __name__ == '__main__':
    from waitress import serve
    #app.run(ssl_context=('/var/servers/servicioSidra/certificados2020Node/docentis_inf_um_es.crt', '/var/servers/servicioSidra/certificados2020Node/mydomain.key'), host='0.0.0.0',port=8384)
    app.run(host='127.0.0.1',port=8384,debug=True)
