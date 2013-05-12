
// Screen objektist pärinevad kõik erinevad mängu nn screenid,
// näiteks "Loading..", "High score", "ingame" ehk mäng ise ka.
// (vt http://www.melonjs.org/docs/symbols/me.ScreenObject.html)
var PlayScreen = me.ScreenObject.extend({
    // Mängu state'i haldus kutsub seda funktsiooni välja,
    // kui mängu state muutub.
    onResetEvent: function () {
        // levelDirector tegeleb leveli jaoks vajalike ressursside
        // laadimise ning haldamisega. Käseme tal level1 sisse laadida:
        // (vt http://www.melonjs.org/docs/symbols/me.levelDirector.html)
        me.levelDirector.loadLevel("level1");
    },

    onDestroyEvent: function () {
        // FIXME: mida teha, kui mäng on lõppenud
    }
});

var ScoreScreen = me.ScreenObject.extend({});

var TitleScreen = me.ScreenObject.extend({

    // constructor
    init: function() {
        this.parent(true);

        // title screen image
        this.title = null;

        this.font = null;
        this.scrollerfont = null;
        this.scrollertween = null;
        this.scrollerpos = 320;
        this.instruction = null;
    },

    onResetEvent: function() {
        if (!this.title) {
            // init stuff if not yet done
            this.title = me.loader.getImage("flame");
            // font to display the menu items
            this.titlefont = new me.Font("Cursive", 40, "yellow", "center");
            this.font = new me.Font("Cursive", 20, "yellow", "center");
            // set the scroller
            this.scrollerfont = new me.BitmapFont("32x32_font", 32);
            this.scrollerfont.set("left");
            this.instruction = false;
        }
        // reset to default value
        this.scrollerpos = 320;

        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.V, "instructions", true);
    },

    update: function() {
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
            return true;
        }
        if (me.input.isKeyPressed('instructions')) {
            this.instruction = true;
            console.log("Noob detected!");
            return true;
        }
        return false;
    },

    // draw function
    draw: function(context) {
        context.drawImage(this.title, 0, 425);
        this.font.draw(context, "PRESS ENTER TO PLAY", 400, 300);
        this.font.draw(context, "PRESS V FOR GAME INSTRUCTIONS", 400, 325);
        this.titlefont.draw(context, "BOMBERMAN", 400, 25);
        if (this.instruction) {
            this.font.draw(context, "YOUR MISSION IS TO KILL EVERYONE EXCEPT YOURSELF.", 400, 75);
            this.font.draw(context, "USE ARROWS TO MOVE AND X TO PLANT BOMB.", 400, 100);
            this.font.draw(context, "HAPPY HUNTING! AND TRY NOT TO BLOW YOURSELF UP...", 400, 125);
        }
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.V);
    }

}); 
