/*:
 * @target MZ
 * @plugindesc Sistema de Batalla en Tiempo Real Básico
 * @author GeekGames
 *
 * @help
 * Este plugin implementa un sistema de batalla en tiempo real básico.
 * VERSION DE PRUEBA ALPHA 0.263
 *
 * Los eventos pueden ser marcados como "enemigo" o "aliado" mediante comentarios.
 */

(function() {
    // Constantes para la configuración del sistema
    const DISTANCIA_DE_ATAQUE = 1;
    const DISTANCIA_DE_PERSECUCION = 5;
    const ENEMY_DAMAGE = 10;

    // Sobrescribir la inicialización de miembros del evento
const originalGameEventInitMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    originalGameEventInitMembers.call(this);
    this._health = 100;
    this._eventTypeChecked = false;
};

// Sobrescribir la función de configuración de evento
const originalGameEventSetup = Game_Event.prototype.setup;
Game_Event.prototype.setup = function(eventId) {
    originalGameEventSetup.call(this, eventId);
    this._originalX = this.x; // Almacenar la posición inicial X del evento
    this._originalY = this.y; // Almacenar la posición inicial Y del evento
};

    // Sobrescribir la actualización del evento
    const originalGameEventUpdate = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        originalGameEventUpdate.call(this);

        if (!this._eventTypeChecked) {
            this._eventType = this.getEventType();
            this._eventTypeChecked = true;
        }

        if (this._eventType === "enemigo") {
            this.verificarDistanciaYActuar();
        } else if (this._eventType === "aliado") {
            this.actualizarAliado();
        }
    };

    // Obtener el tipo de evento (enemigo, aliado)
    Game_Event.prototype.getEventType = function() {
        const eventData = this.event();
        if (!eventData) {
            return null;
        }

        const list = eventData.pages[0].list;
        for (const command of list) {
            if (command.code === 108 || command.code === 408) {
                if (command.parameters[0].includes("enemigo")) {
                    return "enemigo";
                } else if (command.parameters[0].includes("aliado")) {
                    return "aliado";
                }
            }
        }
        return null;
    };

    // Verificar la distancia y realizar una acción para enemigos
    Game_Event.prototype.verificarDistanciaYActuar = function() {
        const distanciaAlJugador = $gamePlayer.distanceTo(this);

        if (distanciaAlJugador <= DISTANCIA_DE_ATAQUE) {
            this.atacarJugador();
        } else if (distanciaAlJugador <= DISTANCIA_DE_PERSECUCION) {
            this.perseguirJugador();
        } else {
            this.moverAleatoriamenteOVolver();
        }
    };

    // Función para atacar al jugador
    Game_Event.prototype.atacarJugador = function() {
        $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
        console.log("El enemigo ataca al jugador!");
    };

    // Función para que el enemigo persiga al jugador
    Game_Event.prototype.perseguirJugador = function() {
        this.moveTowardPlayer();
    };

    // Función para moverse aleatoriamente o volver a la zona original
    Game_Event.prototype.moverAleatoriamenteOVolver = function() {
        if (this.estáFueraDeSuZona()) {
            this.volverAZonaOriginal();
        } else {
            this.moveRandomlyInArea();
        }
    };

    // Verificar si el enemigo está fuera de su área original
    Game_Event.prototype.estáFueraDeSuZona = function() {
        const dx = Math.abs(this.x - this._startX);
        const dy = Math.abs(this.y - this._startY);
        return dx > 4 || dy > 4;
    };

    // Moverse aleatoriamente dentro del rango definido
	Game_Event.prototype.moveRandomlyInArea = function() {
		const dx = Math.floor(Math.random() * 9) - 4; // Rango de -4 a 4
		const dy = Math.floor(Math.random() * 9) - 4; // Rango de -4 a 4
		const targetX = this._originalX + dx;
		const targetY = this._originalY + dy;

    if ($gameMap.isValid(targetX, targetY)) {
        this.moveStraight(this.findDirectionTo(targetX, targetY));
    }
};

    // Volver a la zona original
	Game_Event.prototype.volverAZonaOriginal = function() {
		if (this.x !== this._originalX || this.y !== this._originalY) {
			this.moveStraight(this.findDirectionTo(this._originalX, this._originalY));
		}
	};

    // Función para actualizar el comportamiento del aliado
    Game_Event.prototype.actualizarAliado = function() {
        const distanciaAlJugador = $gamePlayer.distanceTo(this);

        if (distanciaAlJugador > DISTANCIA_DE_PERSECUCION) {
            this.moveRandomlyInArea();
        } else {
            if (distanciaAlJugador > 1) {
                this.moveTowardPlayer();
            } else {
                this.atacarObjetivoMasCercano();
            }
        }
    };

    // Atacar al objetivo más cercano (jugador u otro enemigo)
    Game_Event.prototype.atacarObjetivoMasCercano = function() {
        let objetivos;

        if (this._eventType === "aliado") {
            objetivos = $gameMap.events().filter(event => event._eventType === "enemigo");
        } else {
            // Corrección aquí: 'y' debe ser '&&'
            objetivos = [$gamePlayer].concat($gameMap.events().filter(event => event._eventType === "enemigo" && event !== this));
        }

        if (objetivos.length === 0) return;

        let objetivoMasCercano = objetivos.reduce((prev, current) => {
            return this.distanceTo(current) < this.distanceTo(prev) ? current : prev;
        });

        if (this.distanceTo(objetivoMasCercano) <= DISTANCIA_DE_ATAQUE) {
            // Otra corrección aquí: 'y' debe ser '&&'
            if (this._eventType === "enemigo" && objetivoMasCercano === $gamePlayer) {
                $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
                console.log("El enemigo ataca al jugador!");
            } else {
                console.log("Ataque a otro enemigo!");
            }
        }
    };
})();