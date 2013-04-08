// Peategelase ehk mängija nn entity PlayerEntity
var PlayerEntity = me.ObjectEntity.extend({

    // Nimi pommide omaja eristamiseks ja highscoreiks tulevikus
    name: '',

    // Pommiraadius, ruutudes
    bombradius: 2,

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
            // if we collide with an enemy
            if (res.obj.type === me.game.ENEMY_OBJECT) {
                console.log('collision with enemy');
                // Vaenlase puudutamine paneb flickerdama
                this.flicker(45);
            } else if (res.obj.type === me.game.ACTION_OBJECT) {
                console.log('collision with action object');
                this.flicker(45); // SEE KOOD TOIMIB
            } else {
                console.log('collision with unknown object :)');
                // FIXME: powerupi puudumine peaks selle üles korjama ning powerupi sisse lülitama
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

// Vaenlase entityu
var EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "evil_run_right";
        settings.spritewidth = 32;

        // call the parent constructor
        this.parent(x, y, settings);

        // make him start from the right
        this.pos.x = x;
        this.walkLeft = true;

        // walking & jumping speed
        this.setVelocity(1, 1);

        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
    },

    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {

        if (obj.type === me.game.ACTION_OBJECT) {
            this.flicker(45); // Kui vastane p6rkub pommi objectiga
        }

        if (this.alive) {
            //this.flicker(45);
            //this.setOpacity(0.5);
            //this.setVelocity(2,2);

            if (this.dir === 0) {
                this.dir = 1;
            } else {
                this.dir = 0;
            }
        } 
    },

    // manage the enemy movement
    update: function() {

        // do nothing if not visible
        if (!this.visible)
            return false;

        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            
            // make it walk
            if (this.dir === 0  &&  this.vel.y === 0) {
                this.flipX(this.walkLeft);
                this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
            } else if (this.dir === 1  &&  this.vel.y === 0) {
                this.flipX(0);
                this.vel.x += (this.walkLeft) ? this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
            } else if (this.dir === 2) {
                this.vel.y += (this.walkLeft) ? this.accel.y * me.timer.tick : this.accel.y * me.timer.tick; // alla
            } else if (this.dir === 3) {
                this.vel.y += (this.walkLeft) ? -this.accel.y * me.timer.tick : this.accel.y * me.timer.tick; // yles
            }
        } else {
            this.vel.x = 0;
        }

        // check and update movement
        this.updateMovement();
	
        // if enemy collides with wall, it starts moving in other direction
        // X-telje ja Y-telje kontrollid
        if (this.vel.x === 0  &&  this.vel.y === 0) {
            if (this.dir === 0  ||  this.dir === 1) {
                // Muudetakse vastase liikumise suunda
                this.dir =  Math.floor(Math.random() * 3) + 1;
            } else {
                this.dir = 0;
            }
        }

        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent();
            return true;
        }
        return false;
    }
});

var BombEntity = me.ObjectEntity.extend({

    // Nimi
    name: "bomb",
    
    // Mängija, kes pommi pani (vajalik, highscorei arvutusteks)
    player: null,

    // Pommi raadius, muutub, kuna powerupid on mängus. Ühik on ruutudes.
    bombradius: 0,

    // Millal pomm plahvatab
    explodeAt: 0,

    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.name = "bomb";
        settings.image = "pomm_mini";
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.type = me.game.ACTION_OBJECT;
        settings.collidable = true;
        // this.parent() kutsub päritud init() funktsiooni 
        // välja, ning tolle sees võetakse mitmed väärtused
        // just settings objektilt. vt melonJS lähtekoodi.
        this.parent(x, y, settings);

        if (!settings.player) {
            throw("Must set player with bomb settings!");
        }
        
        this.player = settings.player;
        this.bombradius = this.player.bombradius;
        this.visible = true;

        // Paneme pommi n sek pärast plahvatama
        this.explodeAt = me.timer.getTime() + 5 * 1000;

        console.log(this.type);
    },
    
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
        if (this.alive) {
            //this.flicker(45);
            //this.setOpacity(0.5);
            //this.setVelocity(2,2);
	    
            if (this.dir === 0) {
                this.dir = 1;
            } else {
                this.dir = 0;
            }
        } 
    },

    update: function() {
        // do nothing if not visible

        var res2 = me.game.collide(this);
        
        if (res2) {
            this.flicker(45);
            // if we collide with the bomb
            if (res2.obj.type === me.game.ENEMY_OBJECT) {
                console.log('collision with enemy');
                // Pommi puudutamine paneb flickerdama
                this.flicker(45);
            } else if (res2.obj.type === me.game.ACTION_OBJECT) {
                console.log('collision with action object');
                //this.flicker(45); // 
            } else {
                console.log('collision with unknown object :)');
                // FIXME: powerupi puudumine peaks selle üles korjama ning powerupi sisse lülitama
            }
        }
	
        if (! this.visible)
            return false;
		
        if (this.explodeAt < me.timer.getTime()) {
            this.player.bombs = this.player.bombs - 1;
	    var boom = new Explosion(this.pos.x, this.pos.y, {player: this});
	    me.game.add(boom, 1000);
	    me.game.sort();
            me.game.remove(this);
            this.parent();
            return true;
        }

        return false;
    }
});
var Explosion = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings.image = "boom";
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.type = me.game.ACTION_OBJECT;
	this.parent(x, y, settings);
	this.player = settings.player;
        this.bombradius = this.player.bombradius;
	// Kustutame selle n seki pärast
	this.explodeAt = me.timer.getTime() + 2 * 1000;
    },
    
    update: function() {
	if (this.explodeAt < me.timer.getTime()) {
	    me.game.remove(this);
	    return true;
	}
    }
});
