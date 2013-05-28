// Enemy
var EnemyEntity = me.ObjectEntity.extend({

    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "evil";
        settings.spritewidth = window.bomberman.spritewidth;

        // call the parent constructor
        this.parent(x, y, settings);

        // make him start from the right
        this.pos.x = x;
        this.walkLeft = true;
	
        // enemy can get alarmed when this.lookForPlayer() tells that player is near
        this.alarmed = false;
	
        // walking & jumping speed
        this.setVelocity(1, 1);

        // make it collidable
        this.collidable = true;
	
        // make it an enemy object
        this.type = me.game.ENEMY_OBJECT;
	
        // collisionbox reduced to actual character not image size
        this.updateColRect(7, 50, 10, 54);
    },

    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
        if (this.alive) {
            if (this.dir === "left") {
                this.dir = "right";
            } else {
                this.dir = "left";
            }
        } 
    },

    // manage the enemy movement
    update: function() {
        if (!this.visible)
            return false;

        if (this.alive) {
            
            // make it walk
            if (this.dir === "left" && this.vel.y === 0) {
                this.flipX(this.walkLeft); // if enemy is moving left (this.walkLeft is 1), then flip enemy on X-axis
                this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
            } else if (this.dir === "right" && this.vel.y === 0) {
                this.flipX(0);
                this.vel.x += (this.walkLeft) ? this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
            } else if (this.dir === "down") {
                this.vel.y += (this.walkLeft) ? this.accel.y * me.timer.tick : this.accel.y * me.timer.tick;
            } else if (this.dir === "up") {
                this.vel.y += (this.walkLeft) ? -this.accel.y * me.timer.tick : this.accel.y * me.timer.tick;
            }

            // check and update movement
            this.updateMovement();

            // if enemy collides with wall, it starts moving in other direction
            // X-axis and Y-axis check
            if (this.vel.x === 0 && this.vel.y === 0) {
                if (this.dir === "left" || this.dir === "right") {
                    var roll = Math.floor(Math.random() * 3) + 1;
                    if (roll === 0) {
                        this.dir = "left";
                    } else if (roll === 1) {
                        this.dir = "right";
                    } else if (roll === 2) {
                        this.dir = "down";
                    } else if (roll === 3) {
                        this.dir = "up";
                    }
                } else {
                    this.dir = "left";
                }
            }

            // update animation if necessary
            if (this.vel.x !== 0 || this.vel.y !== 0) {
                this.lookForPlayer();
                // update object animation
                this.parent();
                return true;
            }

        } else if (this.removeAt < me.timer.getTime()) {
            me.game.remove(this);
            return true;
        }

        return false;
    },

    // creates rect sight infront of enemy, when player is within rect sight this.alarmed is set to true.  
    lookForPlayer: function() {
        // Proof of concept
        var playerDistance =  this.distanceTo(window.bomberman.player);
        var playerDirectionAtan2 =  this.angleTo(window.bomberman.player);
	// This is to convert atan2 values to degrees
	var playerDirection = playerDirectionAtan2 * (180 / Math.PI);
	if (playerDirection < 0) { 
	    playerDirection = 180 - playerDirection; 
	}
        var angle = "unknown";
        if (playerDirection < 45.00 || playerDirection > 315.00) {
            angle = "right";
        } else if (playerDirection > 45.00 && playerDirection < 135.00) {
            angle = "up";
        } else if (playerDirection > 135.00 && playerDirection < 225.00) {
            angle = "left";
        } else if (playerDirection > 225.00 && playerDirection < 315.00) {
            angle = "down";
        }
        if (playerDistance < 125) {
            console.log(playerDirection + " " + angle);
            this.alarmed = true; // enemy is close enough to player
            this.setVelocity(1, 1); // increase enemy`s velocity
        }
    },

    die: function() {
        if (!this.alive) {
            // Aready dead
            return;
        }
        if (Math.random() >= 0.5) {
            me.audio.play("moan");
        } else {
            me.audio.play("wscream");
        }
        this.alive = false;
        this.setVelocity(0, 0); // set velocity to 0
        this.flicker(60); // enemy will start flickering
        this.removeAt = me.timer.getTime() + 1 * 1000; // set time for removing enemy object

        me.game.HUD.updateItemValue("score", 10); // increase score
    }
});
