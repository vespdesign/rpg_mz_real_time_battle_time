/*:
 * @target MZ
 * @plugindesc Stamina and life bar
 * @author GeekGames
 *
 * @help
 * Este plugin implementa la barra de vida y estamina.
 * VERSION DE PRUEBA ALPHA 0.1
 */
 
 function Sprite_Bar() {
    this.initialize.apply(this, arguments);
}

Sprite_Bar.prototype = Object.create(Sprite.prototype);
Sprite_Bar.prototype.constructor = Sprite_Bar;

Sprite_Bar.prototype.initialize = function(color, x, y) {
    Sprite.prototype.initialize.call(this);
    this.bitmap = new Bitmap(100, 10); // Tamaño de la barra
    this.color = color;
    this.x = x;
    this.y = y;
    this.redraw();
};

Sprite_Bar.prototype.redraw = function() {
    this.bitmap.clear();
    this.bitmap.fillRect(0, 0, 100, 10, 'gray'); // Fondo de la barra
    this.bitmap.fillRect(0, 0, 100, 10, this.color); // Color de la barra
};

// Añadir las barras de vida y estamina al juego
const _Scene_Map_createSpriteset = Scene_Map.prototype.createSpriteset;
Scene_Map.prototype.createSpriteset = function() {
    _Scene_Map_createSpriteset.call(this);
    const screenHeight = Graphics.boxHeight;
    const screenWidth = Graphics.boxWidth;
    const margin = 10;

    // Crear sprite de la barra de vida
    this._spriteVida = new Sprite_Bar('green', margin, screenHeight - 20 - margin);
    this.addChild(this._spriteVida);

    // Crear sprite de la barra de estamina
    this._spriteEstamina = new Sprite_Bar('blue', screenWidth - 110 - margin, screenHeight - 20 - margin);
    this.addChild(this._spriteEstamina);
};

// Actualizar la barra de vida (la barra de estamina se mantiene llena por ahora)
const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    const vida = $gamePlayer.hp; // Asumiendo que el jugador tiene una propiedad hp
    const vidaMax = $gamePlayer.hpMax; // Asumiendo que el jugador tiene una propiedad hpMax
    this._spriteVida.bitmap.fillRect(0, 0, 100, 10, 'gray');
    this._spriteVida.bitmap.fillRect(0, 0, (vida / vidaMax) * 100, 10, 'green');
};
