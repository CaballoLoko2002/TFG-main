from modelo.vitrina import Vitrina


class User:

    def __init__(self,id,correo,contrasena,nombre,lastname,image,rol,vitrina,history):
        self._id=id
        self.mail = correo
        self.password = contrasena
        self.name = nombre
        self.lastname=lastname
        self.image=image
        self.rol=rol
        self.vitrina = vitrina
        self.history=history

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "nombre": self.name,
            "lastname":self.lastname,
            "correo": self.mail,
            "image":self.image,
            "rol": self.rol,
            "vitrina": self.vitrina,
            "history": self.history
        }

    def setVitrina(self, vitrin):
        self.vitrina = vitrin
