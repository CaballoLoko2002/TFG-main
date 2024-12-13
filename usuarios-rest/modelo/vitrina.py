class Vitrina:

    def __init__(self):
        self.medallaOro = 0
        self.medallaPlata = 0
        self.medallaBronce = 0
        self.trofeoOro = 0
        self.trofeoPlata = 0
        self.trofeoBronce = 0
        self.recordInfinito = 0
        self.recordMix = 0  
        self.numPartidas = 0
        self.victoriasBattleMode = 0

    def setMedallaOro(self, numero):
        self.medallaOro = numero

    def setMedallaPlata(self, numero):
        self.medallaPlata = numero

    def setMedallaBronce(self, numero):
        self.medallaBronce = numero

    def setTrofeo(self, numero):
        self.trofeo = numero

    def setRecordInfinito(self, numero):
        self.recordInfinito = numero

    def setRecordMix(self, numero):  
        self.recordMix = numero

    def setNumPartidas(self, numero):
        self.numPartidas = numero
    
    def setVictoriasBattleMode(self, numero):
        self.victoriasBattleMode = numero
