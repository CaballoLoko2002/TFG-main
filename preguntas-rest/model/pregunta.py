class Pregunta:
    def __init__(self, id, enunciado, solucion, pais, categoria, informacion, image, aciertos=0, fallos=0):
        self._id = id
        self.enunciado = enunciado
        self.solucion = solucion
        self.pais = pais
        self.categoria = categoria
        self.informacion = informacion
        self.image = image
        self.aciertos = aciertos  
        self.fallos = fallos      

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "question": self.enunciado,
            "answer": self.solucion,
            "country": self.pais,
            "topic": self.categoria,
            "information": self.informacion,
            "image": self.image,
            "aciertos": self.aciertos,
            "fallos": self.fallos
        }

    def setImagen(self,imagen):
        self.image = imagen
        
    def incrementar_acierto(self):
        self.aciertos += 1

    def incrementar_fallo(self):
        self.fallos += 1
