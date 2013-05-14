
var TitleScreen = me.ScreenObject.extend({

    // constructor
    init: function() {
        this.parent(true);

        this.flame = null;
	
        // font to display the menu items
        this.titlefont = new me.Font("Cursive", 40, "yellow", "center");
        this.font = new me.Font("Cursive", 20, "yellow", "center");
    },

    onResetEvent: function() {
        if (!this.flame) {
            // init stuff if not yet done
            this.flame = me.loader.getImage("flame");
        }
    },

    update: function() {
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
            return true;
        } else if (me.input.isKeyPressed('instructions')) {
            me.state.change(me.state.USER);
            return true;
        } else if (me.input.isKeyPressed('score')) {
            me.state.change(me.state.SCORE);
            return true;
        } else if (me.input.isKeyPressed('abort')) {
            me.state.change(me.state.MENU);
            return true;
        } 
        return false;
    },

    // draw function
    draw: function(context) {
        context.drawImage(this.flame, 0, 425);
        this.titlefont.draw(context, "BOMBERMAN", me.video.getWidth()/2, 50);
        this.font.draw(context, "PRESS ENTER TO PLAY", me.video.getWidth()/2, 350);
        this.font.draw(context, "PRESS V FOR INSTRUCTIONS", me.video.getWidth()/2, 375);
        this.font.draw(context, "AND S FOR HIGHSCORES", me.video.getWidth()/2, 400);
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.V);
        me.input.unbindKey(me.input.KEY.S);
    }

}); 
