/*:
 * @target MZ
 * @plugindesc Sistema de Batalla en Tiempo Real Básico
 * @author GeekGames
 *
 * @help
 * Este plugin implementa un sistema de batalla en tiempo real básico.
 * VERSION DE PRUEBA ALPHA 0.3 FUNCIONAL
 *
 * Los eventos pueden ser marcados como "enemigo" o "aliado" mediante comentarios.
 */

(function() {
    const DISTANCIA_DE_ATAQUE = 0.5;
    const DISTANCIA_DE_PERSECUCION = 5;
    const ENEMY_DAMAGE = 10;
    const TIEMPO_ESPERA = 60;

    const originalGameEventInitMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        originalGameEventInitMembers.call(this);
        this._health = this._eventType === "aliado" ? 50 : 100;
        this._eventTypeChecked = false;
        this._waitCount = TIEMPO_ESPERA;
        this._originalX = this.x;
        this._originalY = this.y;
    };

    const originalGameEventSetup = Game_Event.prototype.setup;
    Game_Event.prototype.setup = function(eventId) {
        originalGameEventSetup.call(this, eventId);
        this._originalX = this.event().x;
        this._originalY = this.event().y;
    };

    Game_Event.prototype.getEventType = function() {
        const eventData = this.event();
        if (!eventData) return null;
        const list = eventData.pages[0].list;
        for (const command of list) {
            if (command.code === 108 || command.code === 408) {
                if (command.parameters[0].includes("enemigo")) return "enemigo";
                if (command.parameters[0].includes("aliado")) return "aliado";
            }
        }
        return null;
    };

    const originalGameEventUpdate = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        originalGameEventUpdate.call(this);
        if (!this._eventTypeChecked) {
            this._eventType = this.getEventType();
            this._eventTypeChecked = true;
        }
        if (this._eventType === "enemigo" || this._eventType === "aliado") {
            if (this._waitCount > 0) {
                this._waitCount--;
            } else {
                this.comportamientoEvento();
                this._waitCount = TIEMPO_ESPERA;
            }
        }
    };

    Game_Event.prototype.comportamientoEvento = function() {
        const distanciaAlJugador = $gamePlayer.distanceTo(this);
        if (this._eventType === "enemigo" && distanciaAlJugador <= DISTANCIA_DE_ATAQUE) {
            this.atacarJugador();
        } else if (distanciaAlJugador <= DISTANCIA_DE_PERSECUCION) {
            this.perseguirJugador();
        } else {
            this.moveRandomlyInArea();
        }
    };

    Game_Event.prototype.atacarJugador = function() {
        $gameActors.actor(1).setHp($gameActors.actor(1).hp - ENEMY_DAMAGE);
        console.log("El enemigo ataca al jugador!");
    };

    Game_Event.prototype.perseguirJugador = function() {
        this.setDestination($gamePlayer.x, $gamePlayer.y);
    };

    Game_Event.prototype.moveRandomlyInArea = function() {
        const dx = Math.floor(Math.random() * 9) - 4;
        const dy = Math.floor(Math.random() * 9) - 4;
        const targetX = this._originalX + dx;
        const targetY = this._originalY + dy;
        this.setDestination(targetX, targetY);
    };

    Game_Event.prototype.volverAZonaOriginal = function() {
        const dx = Math.abs(this.x - this._originalX);
        const dy = Math.abs(this.y - this._originalY);
        if (dx > 4 || dy > 4) {
            this.setDestination(this._originalX, this._originalY);
        }
    };

    // Llama esta función en el flujo principal para que los aliados y enemigos combatan
Game_Event.prototype.combatirSiEsNecesario = function() {
    const enemigosCercanos = this.encontrarEnemigosCercanos();
    enemigosCercanos.forEach(enemigo => {
        enemigo._health -= ENEMY_DAMAGE;
        if (enemigo._health <= 0) {
            enemigo.eliminar();
        }
    });
};

// Encuentra enemigos cercanos para el combate
Game_Event.prototype.encontrarEnemigosCercanos = function() {
    return $gameMap.events().filter(evento => {
        const esEnemigo = evento._eventType === 'enemigo' && this._eventType === 'aliado';
        const esAliado = evento._eventType === 'aliado' && this._eventType === 'enemigo';
        const distancia = this.distanceTo(evento);
        return (esEnemigo || esAliado) && distancia <= DISTANCIA_DE_ATAQUE;
    });
};

// Eliminar el evento (enemigo o aliado) si la salud es cero
Game_Event.prototype.eliminar = function() {
    this.erase(); // Borra el evento del mapa
    console.log("Evento eliminado: " + this.event().name);
};

    // Resto del código necesario para el plugin...
    // Puedes agregar cualquier otra lógica o funcionalidad adicional necesaria
})();
