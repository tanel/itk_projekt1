
// Peategelase ehk mängija nn entity - PlayerEntity
var PlayerEntity = me.ObjectEntity.extend({

    // Nimi pommide omaja eristamiseks ja highscoreiks tulevikus
    name: '',

    // Aktiivsete pommide arv kaardil
    bombs: 0,
    
    // Max lubatud pommide arv kaardil
    maxAllowedBombs: 3,
    
    // Elud
    lives: 3,
    
    // Score
    score: 0,
 
    init: function(x, y, settings) {
        // call the constructor
        // alternatiivne koht omaduste jaoks tiledi asemel
        settings.image = "gripe_run_right";
        settings.spritewidth = 32;

        this.parent(x, y, settings);
	
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(1, 1);
	
        // maksimumkiirus
        this.maxVel.x = 2;
        this.maxVel.y = 2;

        // eemaldame whitespace'i playeri tile'i ümbert
        this.updateColRect(8, 20, 10, 18);
 
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
 
    },
 
    update: function() {

        if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
			//this.vel.y -= this.accel.y * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }

        if (me.input.isKeyPressed('up')) {
            // flip the sprite on horizontal axis
            this.flipY(false);
            // update the entity velocity
            this.vel.y -= this.accel.y * me.timer.tick;
        } else if (me.input.isKeyPressed('down')) {
            // unflip the sprite
            this.flipY(false);
            // update the entity velocity
            this.vel.y += this.accel.y * me.timer.tick;
        } else {
            this.vel.y = 0;
        }
        
        if (me.input.isKeyPressed('setBomb')) {
            if (this.bombs < this.maxAllowedBombs) {
                this.bombs = this.bombs + 1;
                var bomb = new BombEntity(this.pos.x, this.pos.y, {player: this});
                me.game.add(bomb, 1000);
                me.game.sort(); // ensure the object is properly displayed, vt http://www.melonjs.org/docs/symbols/me.game.html#add
            }
        }
 
        // check & update player movement
        this.updateMovement();

        // check for collision
        var res = me.game.collide(this);
        if (res) {
            // Vaenlase puudutamine paneb flickerdama
            if (res.obj.type === me.game.ENEMY_OBJECT) {
                this.flicker(45);
            } else if (res.obj.type === me.game.ACTION_OBJECT) {
                // FIXME: powerupi puutumine peaks selle üles korjama ning powerupi sisse lülitama
            }
        }

        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent();
            return true;
        }
         
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }
 
});