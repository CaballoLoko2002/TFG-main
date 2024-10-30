from modelo.vitrina import Vitrina


class User:

    def __init__(self, id, correo, contrasena, nombre, lastname, image, rol, vitrina, history,
                 classroom_challenge=0, battlemode=0, single_player=0, infinite_mode=0):
        self._id = id
        self.mail = correo
        self.password = contrasena
        self.name = nombre
        self.lastname = lastname
        self.image = image
        self.rol = rol
        self.vitrina = vitrina
        self.history = history
        self.classroom_challenge = classroom_challenge
        self.battlemode = battlemode
        self.single_player = single_player
        self.infinite_mode = infinite_mode

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "nombre": self.name,
            "lastname":self.lastname,
            "correo": self.mail,
            "image":self.image,
            "rol": self.rol,
            "vitrina": self.vitrina,
            "history": self.history,
            "classroom_challenge": self.classroom_challenge,
            "battlemode": self.battlemode,
            "single_player": self.single_player,
            "infinite_mode": self.infinite_mode
        }

    def setVitrina(self, vitrin):
        self.vitrina = vitrin
