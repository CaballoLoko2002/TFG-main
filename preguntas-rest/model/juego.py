class Juego():
    def __init__(self,id,nombre,code,status):
        self._id=id
        self.nombre=nombre
        self.code=code
        self.status=status

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "name": self.nombre,
            "code": self.code,
            "status":self.status
        }