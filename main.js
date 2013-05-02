/*global window: false, alert: false, me: false */

(function () {
    "use strict";

    // bomberman on nö namespace, mille küljes asuvad
    // kõik mänguga seotud objektid, funktsioonid, ressursid jne.
    window.bomberman = {};

    // Kui URLi lõppu brauseris lisada ?debug, siis kuvatakse igasugu debug infot.
    if (window.location && window.location.href && (/debug/.test(window.location.href))) {
        window.bomberman.debug = true;
    }

    me.debug.renderHitBox = window.bomberman.debug;

    // Mängu vajaminevate ressursside massiiv.
    // Leveli map ise on TMX formaadis, vt lisaks https://github.com/bjorn/tiled/wiki/TMX-Map-Format
    // Leveli mapi redigeerimiseks on vajalik Tiled Map Editor, vt http://www.mapeditor.org/
    window.bomberman.resources = [{
        name: "level1_tileset", // NB! oluline, et oleks sama nimega, mis TMX failis
        type: "image",
        src: "data/level1_tileset.png"
    }, {
        name: "metatiles32x32", // NB! oluline, et oleks sama nimega, mis TMX failis
        type: "image",
        src: "data/metatiles32x32.png"
    }, {
        name: "level1",
        type: "tmx",
        src: "data/level1.tmx"
    }, {                                     // Graafika
        name: "gripe_run_right",
        type: "image",
        src: "data/sprite/gripe_run_right.png"
    }, {
        name: "titlescreen",
        type: "image",
        src: "data/title.png"
    }, {
        name: "pomm_mini",
        type: "image",
        src: "data/sprite/pomm_mini.png"
    }, {
        name: "boom",
        type: "image",
        src: "data/sprite/prim_plahvatus.png" // Ajutine, teise plahvatuse pildiga on komplikatsioone
    }, {
        name: "evil_run_right",
        type: "image",
        src: "data/sprite/evil_run_right.png"
    }, {                                      // Audio
	name: "moan",                         
        type: "audio",
        src: "data/audio/", channel: 1
    }, {    
	name: "fuse",
        type: "audio",
        src: "data/audio/", channel: 1
    }, {    
	name: "bomb",
        type: "audio",
        src: "data/audio/", channel: 1
    }, {                                      // Fontid
        name: "32x32_font",
        type: "image",
        src: "data/sprite/32x32_font.png"
    }];

    // Mäng ise
    window.bomberman.game = {

        // Alustame mängu laadimist
        onload: function () {
            // Video initsiliaseerimise parameetrid on:
            // wrapper, width, height, double_buffering, scale, maintainAspectRatio
            // (vt http://www.melonjs.org/docs/symbols/me.video.html#init)
            if (!me.video.init('bombermanGame', 640, 480, false, 1.0, false)) {
                alert("Teie veebilehitseja ei toeta HTML5 canvas tehnoloogiat. Ei saa jätkata :(");
                return;
            }

            // MelonJS loader proovib audiofaile laadida sellest järjekorras: mp3, ogg.
            // Kui veebilehitsejal puuduvad sobivad audio codec'id, siis mängul heli puudub
            // (vt http://www.melonjs.org/docs/symbols/me.audio.html#init)
            me.audio.init("mp3");
            // loader tegeleb mängu ressursside laadimisega. Kui ta on laadimisega
            // valmis saanud, siis tahame, et ta käivitaks meie funktsiooni "loaded":
            // (vt http://www.melonjs.org/docs/symbols/me.loader.html)
            me.loader.onload = this.loaded.bind(this);

            // Alustame mängule vajalike ressursside laadimist:
            me.loader.preload(window.bomberman.resources);

            // Kuniks mängu ressursid laevad, kuvame "Loading.." lehe kasutajale.
            me.state.change(me.state.LOADING);
        },

        // Kui mäng on laetud, käivitab loader siinse funktsiooni,
        // sest omistasime selle eelnevalt me.loader.onload'ile:
        loaded: function () {

            // cool transition between gamestates
            me.state.transition("fade", "#000000", 200);
	    
	    // Disable transition for menu
	    me.state.setTransition(me.state.MENU, false);

            // Makes framecounter visible if browser has javascript support
            framecounter.setAttribute('style', 'visibility: visible');

            // Defines gamestate screens
            me.state.set(me.state.PLAY, new window.bomberman.playScreen());
            me.state.set(me.state.SCORE, new window.bomberman.playScreen());
	    me.state.set(me.state.MENU, new window.bomberman.titleScreen());

            // Lisame entity pooli playeri ja vaenlase
            me.entityPool.add("mainPlayer", PlayerEntity);
            me.entityPool.add("enemyentity", EnemyEntity);

            // Lets disable default gravity
            me.sys.gravity = 0;

            // enable the keyboard
            me.input.bindKey(me.input.KEY.LEFT, "left");
            me.input.bindKey(me.input.KEY.RIGHT, "right");
            me.input.bindKey(me.input.KEY.UP, "up");
            me.input.bindKey(me.input.KEY.DOWN, "down");
            me.input.bindKey(me.input.KEY.X, "setBomb", true);
            me.input.bindKey(me.input.KEY.M, "music", true);
            me.input.bindKey(me.input.KEY.ESC, "abort", true);

            // Set gamestate to MENU.
            me.state.change(me.state.MENU);
        }
    };

    // Screen objektist pärinevad kõik erinevad mängu nn screenid,
    // näiteks "Loading..", "High score", "ingame" ehk mäng ise ka.
    // (vt http://www.melonjs.org/docs/symbols/me.ScreenObject.html)
    window.bomberman.playScreen = me.ScreenObject.extend({
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

    window.bomberman.scoreScreen = me.ScreenObject.extend({});
    window.bomberman.titleScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
	
	// title screen image
        this.title = null;

        this.font = null;
        this.scrollerfont = null;
        this.scrollertween = null;
	this.scroller = "Press enter to play.";
	this.scrollerpos = 320;
    },

    // reset function
    onResetEvent: function() {
        if (this.title == null) {
            // init stuff if not yet done
            this.title = me.loader.getImage("titlescreen");
            // font to display the menu items
            this.font = new me.BitmapFont("32x32_font", 32);
            this.font.set("left");
	    
	    // set the scroller
            this.scrollerfont = new me.BitmapFont("32x32_font", 32);
            this.scrollerfont.set("left");
	}
	// reset to default value
        this.scrollerpos = 320;
	
	// enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    },

    // update function
    update: function() {
	// enter pressed ?
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
        }
        return true;
    },

    // draw function
    draw: function(context) {
	context.drawImage(this.title, 0, 0);
	this.font.draw(context, "PRESS ENTER TO PLAY", 20, 240);
    },

    // destroy function
    onDestroyEvent: function() {
	me.input.unbindKey(me.input.KEY.ENTER);
    }

    }); 


    // Kui leht on brauserisse laetud, hakkab mäng laadima
    window.onReady(function () {
        window.bomberman.game.onload();
    });

}).call(this);