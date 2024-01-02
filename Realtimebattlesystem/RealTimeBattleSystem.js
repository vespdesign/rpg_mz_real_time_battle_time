/*:
 * @target MZ
 * @plugindesc Sistema de Batalla en Tiempo Real Básico
 * @author GeekGames
 *
 * @help
 * Este plugin implementa un sistema de batalla en tiempo real básico.
 * VERSION DE PRUEBA ALPHA 0.24
 *
 * Los eventos pueden ser marcados como "enemigo" o "aliado" mediante comentarios.
 */

(function() {
    // Constantes para la configuración del sistema
    const DISTANCIA_DE_ATAQUE = 1;   // Distancia para iniciar el ataque
    const DISTANCIA_DE_PERSECUCION = 5;  // Distancia para que el enemigo persiga al jugador
    const ENEMY_DAMAGE = 10; // Cantidad de daño que el enemigo hace al jugador

    // Guardar la referencia original de initMembers de Game_Event
    const originalGameEventInitMembers = Game_Event.prototype.initMembers;

    // Sobrescribir la inicialización de miembros del evento
    Game_Event.prototype.initMembers = function() {
        originalGameEventInitMembers.call(this);
        this._health = 100; // Valor predeterminado de la salud del enemigo
        this._startX = this.x; // Almacenar la posición inicial X
        this._startY = this.y; // Almacenar la posición inicial Y
        this._eventType = this.getEventType(); // Determina el tipo de evento
    };

    // Obtener el tipo de evento (enemigo, aliado)
    Game_Event.prototype.getEventType = function() {
        const list = this.page().list;
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

    // Guardar la referencia original de update de Game_Event
    const originalGameEventUpdate = Game_Event.prototype.update;

    // Sobrescribir la actualización del evento
    Game_Event.prototype.update = function() {
        originalGameEventUpdate.call(this);

        if (this._eventType === "enemigo") {
            this.verificarDistanciaYActuar();
        } else if (this._eventType === "aliado") {
            this.actualizarAliado();
        }
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
        const targetX = this._startX + dx;
        const targetY = this._startY + dy;

        if ($gameMap.isValid(targetX, targetY)) {
            this.moveStraight(this.findDirectionTo(targetX, targetY));
        }
    };

    // Volver a la zona original
    Game_Event.prototype.volverAZonaOriginal = function() {
        if (this.x !== this._startX || this.y !== this._startY) {
            this.moveStraight(this.findDirectionTo(this._startX, this._startY));
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
            objetivos = [$gamePlayer].concat($gameMap.events().filter(event => event._eventType === "enemigo" && event !== this));
        }

        if (objetivos.length === 0) return;

        let objetivoMasCercano = objetivos.reduce((prev, current) => {
            return this.distanceTo(current) < this.distanceTo(prev) ? current : prev;
        });

        if (this.distanceTo(objetivoMasCercano) <= DISTANCIA_DE_ATAQUE) {
            if (this._eventType === "enemigo" && objetivoMasCercano === $gamePlayer) {
                $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
                console.log("El enemigo ataca al jugador!");
            } else {
                console.log("Ataque a otro enemigo!");
            }
        }
    };

})();