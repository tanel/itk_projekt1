
var BombEntity = me.ObjectEntity.extend({

    // Nimi
    name: "bomb",
    
    // Mängija, kes pommi pani (vajalik, highscorei arvutusteks)
    player: null,

    // Millal pomm plahvatab
    explodeAt: 0,

    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.name = "bomb";
        settings.image = "pomm_mini";
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.type = me.game.ACTION_OBJECT;
        // this.parent() kutsub päritud init() funktsiooni 
        // välja, ning tolle sees võetakse mitmed väärtused
        // just settings objektilt. vt melonJS lähtekoodi.
        this.parent(x, y, settings);

        if (!settings.player) {
            throw("Must set player with bomb settings!");
        }
        
        this.player = settings.player;
        this.visible = true;

        me.audio.play("fuse", false, null, 0.6);

        // Paneme pommi n sek pärast plahvatama
        this.explodeAt = me.timer.getTime() + 1.5 * 1000;
    },
    
    update: function() {
        // do nothing if not visible
        if (! this.visible)
            return false;

        if (this.explodeAt < me.timer.getTime()) {
            this.player.bombs = this.player.bombs - 1;
            var arkRight = new Explosion(this.pos.x, this.pos.y, {bomb: this}, "R");
            var arkLeft = new Explosion(this.pos.x, this.pos.y, {bomb: this}, "L");
	    var arkUp = new Explosion(this.pos.x, this.pos.y, {bomb: this}, "U");
	    var arkDown = new Explosion(this.pos.x, this.pos.y, {bomb: this}, "D");
            me.game.add(arkRight, 1000);
            me.game.add(arkLeft, 1000);
	    me.game.add(arkUp, 1000);
	    me.game.add(arkDown, 1000);
            me.game.sort();
            me.game.remove(this);
            this.parent();
            return true;
        }

        return false;
    }
});
