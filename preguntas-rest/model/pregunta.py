class Pregunta:

    def __init__(self,id,enunciado,solucion,pais,categoria,informacion,image):
        self._id=id
        self.enunciado = enunciado
        self.solucion = solucion
        self.pais =pais
        self.categoria = categoria
        self.informacion=informacion
        self.image = image

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "question": self.enunciado,
            "answer":self.solucion,
            "country": self.pais,
            "topic":self.categoria,
            "information": self.informacion,
            "image": self.image
        }

    def setImagen(self,imagen):
        self.image = imagen