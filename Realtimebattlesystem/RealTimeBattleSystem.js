/*:
 * @target MZ
 * @plugindesc Sistema de Batalla en Tiempo Real Básico
 * @author GeekGames
 *
 * @help
 * Este plugin implementa un sistema de batalla en tiempo real básico.
 * VERSION DE PRUEBA ALPHA 0.21
 */

(function() {
    // Constantes para la configuración del sistema
    const DISTANCIA_DE_ATAQUE = 1;   // Distancia para iniciar el ataque
    const DISTANCIA_DE_PERSECUCION = 5;  // Distancia para que el enemigo persiga al jugador
    const ENEMY_DAMAGE = 10; // Cantidad de daño que el enemigo hace al jugador

    // Sobrescribir la actualización del evento del enemigo
    const originalGameEventUpdate = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        // Llamada original a la actualización del evento
        originalGameEventUpdate.call(this);

        // Verificar si el evento tiene el comentario "battlesystem"
        if (this.tieneComentarioBattleSystem()) {
            // Lógica de detección y ataque
            this.verificarDistanciaYActuar();
        }
    };

    // Verificar si el evento contiene el comentario "battlesystem"
    Game_Event.prototype.tieneComentarioBattleSystem = function() {
        const list = this.page().list;
        for (const command of list) {
            if (command.code === 108 || command.code === 408) {
                if (command.parameters[0].includes("battlesystem")) {
                    return true;
                }
            }
        }
        return false;
    };

    // Función para verificar la distancia y realizar una acción (atacar o perseguir)
    Game_Event.prototype.verificarDistanciaYActuar = function() {
        const distanciaAlJugador = $gamePlayer.distanceTo(this);

        // Si el jugador está dentro del rango de ataque
        if (distanciaAlJugador <= DISTANCIA_DE_ATAQUE) {
            this.atacarJugador();
        }
        // Si el jugador está dentro del rango de persecución pero fuera del rango de ataque
        else if (distanciaAlJugador <= DISTANCIA_DE_PERSECUCION) {
            this.perseguirJugador();
        } else {
            // Moverse aleatoriamente o volver a la zona original
            this.moverAleatoriamenteOVolver();
        }
    };

    // Función para atacar al jugador
    Game_Event.prototype.atacarJugador = function() {
        // Lógica de ataque: reduce la salud del jugador
        $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
        console.log("El enemigo ataca al jugador!");
    };

    // Función para que el enemigo persiga al jugador
    Game_Event.prototype.perseguirJugador = function() {
        this.moveTowardPlayer();
        console.log("El enemigo persigue al jugador");
    };

    // Función para moverse aleatoriamente o volver a la zona original
    Game_Event.prototype.moverAleatoriamenteOVolver = function() {
        // Implementar la lógica de movimiento aquí
    };

    // Función para moverse aleatoriamente o volver a la zona original
	Game_Event.prototype.moverAleatoriamenteOVolver = function() {
    if (this.estáFueraDeSuZona()) {
        this.volverAZonaOriginal();
    } else {
        this.moveRandomlyInArea();
    }
	};
	
	// Sobrescribir la inicialización de miembros del evento
	const originalGameEventInitMembers = Game_Event.prototype.initMembers;
	Game_Event.prototype.initMembers = function() {
    originalGameEventInitMembers.call(this);
    this._health = 100; // Valor predeterminado de la salud del enemigo
    this._startX = this.x; // Almacenar la posición inicial X
    this._startY = this.y; // Almacenar la posición inicial Y
};

};
	
	// Verificar si el enemigo está fuera de su área original
	Game_Event.prototype.estáFueraDeSuZona = function() {
		const dx = Math.abs(this.x - this.startX());
		const dy = Math.abs(this.y - this.startY());
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

	// Atacar al objetivo más cercano (jugador u otro enemigo)
	Game_Event.prototype.atacarObjetivoMasCercano = function() {
		let objetivos = [$gamePlayer].concat($gameMap.events().filter(event => event.tieneComentarioBattleSystem() && event !== this));
		let objetivoMasCercano = objetivos.reduce((prev, current) => {
        return this.distanceTo(current) < this.distanceTo(prev) ? current : prev;
    });

    // Determinar si el objetivo más cercano está dentro del rango de ataque
    if (this.distanceTo(objetivoMasCercano) <= DISTANCIA_DE_ATAQUE) {
        // Implementar lógica de ataque
        if (objetivoMasCercano === $gamePlayer) {
            // Atacar al jugador
            $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
            console.log("El enemigo ataca al jugador!");
        } else {
            // Atacar a otro enemigo
            // Aquí necesitarás una forma de reducir la salud del enemigo atacado, que dependerá de cómo estés manejando su salud.
            console.log("El enemigo ataca a otro enemigo!");
        }
    }
	};

})();