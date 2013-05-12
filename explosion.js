var Explosion = me.ObjectEntity.extend({
    init: function(x, y, settings, direction) {
        settings.image = "boom";
        me.audio.play("bomb", false, null, 0.6);

        settings.spritewidth = window.bomberman.spritewidth;
        settings.spriteheight = window.bomberman.spritewidth;
        settings.type = me.game.ACTION_OBJECT;
        settings.name = "explosion";
        settings.collidable = true;

        this.parent(x, y, settings);

        this.bomb = settings.bomb;
        this.extTime = 70;
        this.bombRadius = 6;
        this.currentRadius = 1;
        this.direction = direction;

        // Clear explosion after n seconds
        this.endTime = me.timer.getTime() + (this.extTime * (this.bombRadius + 1));
    },
    
    update: function() {
        // do nothing if not visible
        if (! this.visible)
            return false;

        // Extends explosion in proper direction
        if (this.currentRadius < this.bombRadius) {
            var x = 0,
            w = window.bomberman.spritewidth,
            y = 0,
            h = window.bomberman.spritewidth;
            if (this.direction === "right") {
                w = window.bomberman.spritewidth * this.currentRadius + window.bomberman.spritewidth;
            } else if (this.direction === "left") {
                x = window.bomberman.spritewidth * -this.currentRadius;
                w = window.bomberman.spritewidth * this.currentRadius;
            } else if (this.direction === "up") {
                y = window.bomberman.spritewidth * -this.currentRadius;
                h = window.bomberman.spritewidth * this.currentRadius;
            } else if (this.direction === "down") {
                h = window.bomberman.spritewidth * this.currentRadius + window.bomberman.spritewidth;
            }
            this.updateColRect(x, w, y, h);
            this.currentRadius++;
        }

        // Searches objects that are in explosion and removes them.
        var mres = me.game.collide(this, true);
        if (mres) {
            for (var i = 0; i < mres.length; i++) {
                var res = mres[i];

                // Ignore other explosion collisions
                if (res.obj.type === me.game.ENEMY_OBJECT && res.obj.alive) {
                    res.obj.die();
                }

                if (res.obj.name == "mainplayer" && res.obj.alive) {
                    res.obj.die();
                }
            }
        }

        if (this.endTime <= me.timer.getTime()) {
            me.game.remove(this);
        }

        // update object animation
        this.parent();
        return true;
    }
});
