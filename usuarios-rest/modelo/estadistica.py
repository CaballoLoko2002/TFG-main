class Estadistica:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(Estadistica, cls).__new__(cls)
        return cls._instance

    def __init__(self, partidas_jugadas=0, preguntas_acertadas=0, preguntas_falladas=0, 
                 preguntas_totales=0, partidas_classroom=0, preguntas_classroom_acertadas=0, 
                 preguntas_classroom_falladas=0, partidas_battlemode=0, 
                 preguntas_battlemode_acertadas=0, preguntas_battlemode_falladas=0, 
                 partidas_singleplayer=0, preguntas_singleplayer_acertadas=0, 
                 preguntas_singleplayer_falladas=0, partidas_infinity_mode=0, 
                 preguntas_infinity_mode_acertadas=0, preguntas_infinity_mode_falladas=0):
        # Evitamos re-inicializar si ya ha sido inicializado
        if not hasattr(self, 'inicializado'):
            self.partidas_jugadas = partidas_jugadas
            self.preguntas_acertadas = preguntas_acertadas
            self.preguntas_falladas = preguntas_falladas
            self.preguntas_totales = preguntas_totales

            # Classroom mode
            self.partidas_classroom = partidas_classroom
            self.preguntas_classroom_acertadas = preguntas_classroom_acertadas
            self.preguntas_classroom_falladas = preguntas_classroom_falladas

            # Battle mode
            self.partidas_battlemode = partidas_battlemode
            self.preguntas_battlemode_acertadas = preguntas_battlemode_acertadas
            self.preguntas_battlemode_falladas = preguntas_battlemode_falladas

            # Single player mode
            self.partidas_singleplayer = partidas_singleplayer
            self.preguntas_singleplayer_acertadas = preguntas_singleplayer_acertadas
            self.preguntas_singleplayer_falladas = preguntas_singleplayer_falladas

            # Infinity mode
            self.partidas_infinity_mode = partidas_infinity_mode
            self.preguntas_infinity_mode_acertadas = preguntas_infinity_mode_acertadas
            self.preguntas_infinity_mode_falladas = preguntas_infinity_mode_falladas

            # Marcamos que la instancia ya ha sido inicializada
            self.inicializado = True

    def to_dict(self):
        """Devuelve las estadísticas como un diccionario."""
        return {
            'partidas_jugadas': self.partidas_jugadas,
            'preguntas_acertadas': self.preguntas_acertadas,
            'preguntas_falladas': self.preguntas_falladas,
            'preguntas_totales': self.preguntas_totales,
            'partidas_classroom': self.partidas_classroom,
            'preguntas_classroom_acertadas': self.preguntas_classroom_acertadas,
            'preguntas_classroom_falladas': self.preguntas_classroom_falladas,
            'partidas_battlemode': self.partidas_battlemode,
            'preguntas_battlemode_acertadas': self.preguntas_battlemode_acertadas,
            'preguntas_battlemode_falladas': self.preguntas_battlemode_falladas,
            'partidas_singleplayer': self.partidas_singleplayer,
            'preguntas_singleplayer_acertadas': self.preguntas_singleplayer_acertadas,
            'preguntas_singleplayer_falladas': self.preguntas_singleplayer_falladas,
            'partidas_infinity_mode': self.partidas_infinity_mode,
            'preguntas_infinity_mode_acertadas': self.preguntas_infinity_mode_acertadas,
            'preguntas_infinity_mode_falladas': self.preguntas_infinity_mode_falladas
        }

    @classmethod
    def from_dict(cls, data):
        """Crea una instancia de Estadistica a partir de un diccionario."""
        return cls(
            partidas_jugadas=data.get('partidas_jugadas', 0),
            preguntas_acertadas=data.get('preguntas_acertadas', 0),
            preguntas_falladas=data.get('preguntas_falladas', 0),
            preguntas_totales=data.get('preguntas_totales', 0),
            partidas_classroom=data.get('partidas_classroom', 0),
            preguntas_classroom_acertadas=data.get('preguntas_classroom_acertadas', 0),
            preguntas_classroom_falladas=data.get('preguntas_classroom_falladas', 0),
            partidas_battlemode=data.get('partidas_battlemode', 0),
            preguntas_battlemode_acertadas=data.get('preguntas_battlemode_acertadas', 0),
            preguntas_battlemode_falladas=data.get('preguntas_battlemode_falladas', 0),
            partidas_singleplayer=data.get('partidas_singleplayer', 0),
            preguntas_singleplayer_acertadas=data.get('preguntas_singleplayer_acertadas', 0),
            preguntas_singleplayer_falladas=data.get('preguntas_singleplayer_falladas', 0),
            partidas_infinity_mode=data.get('partidas_infinity_mode', 0),
            preguntas_infinity_mode_acertadas=data.get('preguntas_infinity_mode_acertadas', 0),
            preguntas_infinity_mode_falladas=data.get('preguntas_infinity_mode_falladas', 0)
        )

    def guardar_en_base_datos(self, db):
        """Guarda la estadística en la base de datos."""
        estadisticas_coleccion = db.estadisticas
        # Usar un solo documento para guardar las estadísticas
        estadisticas_coleccion.update_one({}, {"$set": self.to_dict()}, upsert=True)

    @classmethod
    def cargar_desde_base_datos(cls, db):
        """Carga la estadística desde la base de datos."""
        estadisticas_coleccion = db.estadisticas
        datos = estadisticas_coleccion.find_one({})
        if datos:
            return cls.from_dict(datos)
        else:
            return cls()  # Devuelve una instancia vacía si no existen datos


    def actualiza_partida(self, modo, respuestasCorrectas, respuestasIncorrectas):
        """Actualiza los datos de una partida."""
        self.sumar_partida_jugada(modo)
        self.sumar_pregunta_acertada(modo, respuestasCorrectas)
        self.sumar_pregunta_fallada(modo, respuestasIncorrectas)

    def sumar_partida_jugada(self, modo):
        """Suma una partida jugada en el modo especificado."""
        self.partidas_jugadas += 1

        if modo == 'Classroom':
            self.partidas_classroom += 1
        elif modo == 'Battlemode':
            self.partidas_battlemode += 1
        elif modo == 'Singleplayer':
            self.partidas_singleplayer += 1
        elif modo == 'Infinity Mode':
            self.partidas_infinity_mode += 1

    def sumar_pregunta_acertada(self, modo, numero_preguntas):
        """Suma preguntas acertadas en el modo especificado."""
        self.preguntas_totales += numero_preguntas
        self.preguntas_acertadas += numero_preguntas

        if modo == 'Classroom':
            self.preguntas_classroom_acertadas += numero_preguntas
        elif modo == 'Battlemode':
            self.preguntas_battlemode_acertadas += numero_preguntas
        elif modo == 'Singleplayer':
            self.preguntas_singleplayer_acertadas += numero_preguntas
        elif modo == 'Infinity Mode':
            self.preguntas_infinity_mode_acertadas += numero_preguntas

    def sumar_pregunta_fallada(self, modo, numero_preguntas):
        """Suma preguntas falladas en el modo especificado."""
        self.preguntas_totales += numero_preguntas
        self.preguntas_falladas += numero_preguntas

        if modo == 'Classroom':
            self.preguntas_classroom_falladas += numero_preguntas
        elif modo == 'Battlemode':
            self.preguntas_battlemode_falladas += numero_preguntas
        elif modo == 'Singleplayer':
            self.preguntas_singleplayer_falladas += numero_preguntas
        elif modo == 'Infinity Mode':
            self.preguntas_infinity_mode_falladas += numero_preguntas

    def mostrar_estadisticas(self):
        """Devuelve las estadísticas en un formato estructurado."""
        return {
            'Partidas Jugadas': self.partidas_jugadas,
            'Preguntas Acertadas': self.preguntas_acertadas,
            'Preguntas Falladas': self.preguntas_falladas,
            'Preguntas Totales': self.preguntas_totales,
            'Classroom': {
                'Partidas': self.partidas_classroom,
                'Acertadas': self.preguntas_classroom_acertadas,
                'Falladas': self.preguntas_classroom_falladas,
            },
            'Battlemode': {
                'Partidas': self.partidas_battlemode,
                'Acertadas': self.preguntas_battlemode_acertadas,
                'Falladas': self.preguntas_battlemode_falladas,
            },
            'Singleplayer': {
                'Partidas': self.partidas_singleplayer,
                'Acertadas': self.preguntas_singleplayer_acertadas,
                'Falladas': self.preguntas_singleplayer_falladas,
            },
            'Infinity Mode': {
                'Partidas': self.partidas_infinity_mode,
                'Acertadas': self.preguntas_infinity_mode_acertadas,
                'Falladas': self.preguntas_infinity_mode_falladas,
            }
        }

