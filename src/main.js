var winW = 500;
var winH = 880;


var game = new Phaser.Game(winW, winH, Phaser.AUTO, 'container');

var group;
var myhand;
var hand;
var hitPic;
var isHitting = false;
var isHided = 0;
var totalChance = 5;
var isHiding = false;
var time = 30;
var leftTimeText;
var hitted = false;
var NPC;
var hitAnim;
var scare;
var hit;
var scare;
var lock;

game.States = {};

game.States.main = function() {
    this.preload = function() {
        game.load.image('bg', 'assets/img/bg.png');
        game.load.image('myhand', 'assets/img/myhand.png');
        game.load.image('button2', 'assets/img/button2.png');
        game.load.image('yanggong', 'assets/img/yanggong.png');
        game.load.image('boom', 'assets/img/boom.png');
        game.load.image('jingong', 'assets/img/jingong.png');
        game.load.image('lock', 'assets/img/lock.png');
        game.load.spritesheet('chance', 'assets/img/chance.png',53,50,2);
        game.load.spritesheet('hand', 'assets/img/hand.png',282,800,2);
        game.load.bitmapFont('number', 'assets/img/number.png', 'assets/img/number.xml');
        if (!game.device.desktop) {
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.forcePortrait = true;
            this.scale.refresh();
        }
    };
    this.create = function() {
        // 初始化
        isHitting = false;
        isHiding = false;
        isHided = 0;
        totalChance = 5;
        time = 30;
        hitted = false;
        var chanceArray = new Array(totalChance);
        if(NPC){
            game.time.events.remove(NPC);
        }

        // 物理系统
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // 所有精灵的组，便于翻转180度
        group = game.add.group(); 

        // 背景
        var bg = game.add.tileSprite(0,0, winW, winH,'bg')
        group.addChild(bg)

        // 被打的手
        myhand = game.add.sprite(game.world.centerX,790,'myhand')
        myhand.scale.setTo(0.8)
        myhand.anchor.setTo(0.5,0.5)
        myhand.inputEnabled = true;
        group.addChild(myhand)
        game.physics.arcade.enable(myhand);

        // 打到的图片
        hitPic = game.add.sprite(20,420,'boom')
        group.addChild(hitPic)
        hitPic.visible = false;

        // 打的手
        hand = game.add.sprite(game.world.centerX,70,'hand')
        hand.scale.setTo(0.8)
        hand.anchor.setTo(0.5,0.5)
        // hand.angle = 180;
        hand.inputEnabled = true;
        group.addChild(hand)
        game.physics.arcade.enable(hand);

        // 打的动画
        hit = game.add.tween(hand);
        hit.to( { y: 350 }, 500, Phaser.Easing.Back.Out,false,0,0,true);
        hit.onStart.add(()=>{})
        hit.onComplete.add(()=> {
            hand.frame = 2;
            isHitting = false;
        })

        // 吓唬的动画
        scare = game.add.tween(hand);
        scare.to( { y: 160 }, 120, Phaser.Easing.Cubic.In,false,0,0,true);
        scare.onStart.add(()=>{})
        scare.onComplete.add(()=>{})

        // 躲手的动画
        var hide = game.add.tween(myhand)
        hide.to( { y: 2100 }, 600, Phaser.Easing.Linear.None,false,0,0,true);
        hide.onStart.add(()=>{
            chanceArray[isHided].frame = 2;
        })
        hide.onComplete.add(()=> {
            isHided++;
            isHiding = false;
            if(isHided === totalChance){
                lock.visible = true;
            }
        })

        // // 吓唬按钮
        // var button1 = game.add.button(0,0,'yanggong',()=>{
        //     if(isHitting || hitted){
        //         return;
        //     }
        //     scare.start()
        // })
        // group.addChild(button1)
        // button1.width = 250;
        // button1.height = 140;

        // // 真打按钮
        // var button3 = game.add.button(250,0,'jingong',()=>{
        //     if(isHitting || hitted || isHiding){
        //         return;
        //     }
        //     isHitting = true;
        //     hand.play('hit',4,false);
        //     hitAnim.onComplete.add(()=>{
        //         hit.start()
        //     }, this);
        // })
        // group.addChild(button3)
        // button3.width = 250;
        // button3.height = 140;

        // 手铐
        lock = game.add.sprite(140,640,'lock');
        lock.scale.setTo(0.8)
        lock.visible = false;

        // 躲避按钮
        var button2 = game.add.button(0,740,'button2',()=>{
            if(isHiding ===false && isHided < totalChance && !hitted){
                isHiding = true;
                hide.start()
            }
        })
        group.addChild(button2)
        button2.width = winW;
        button2.height = 140;

        // 打手
        hitAnim = hand.animations.add('hit');
        hand.events.onInputDown.add(()=>{},this);

        // 一共几次机会的组
        for(var i = 0;i<chanceArray.length;i++){
            chanceArray[i] = game.add.sprite(20,470 + i*50,'chance');
            chanceArray[i].scale.setTo(0.8)
            chanceArray[i].frame = 1
            group.addChild(chanceArray[i])
        }

        // 倒计时文字
        leftTimeText = game.add.bitmapText(260, 40, 'number', time, 80);
        leftTimeText.anchor.setTo(0.5,0.5);
        leftTimeText.angle = -5;
        game.add.tween(leftTimeText.scale).to({x:0.8,y:0.8}, 1000, 'Linear', true,0,-1,true)
        game.add.tween(leftTimeText).to({angle:5}, 1000, 'Linear', true,0,-1,true)

        // 倒计时操作
        game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(time > 0){
                time--;
            }else if(time === 0){
                game.state.start('over')
            }
        }, this);

        // 电脑模拟打手
        NPC = game.time.events.loop(Phaser.Timer.SECOND * 3, this.NPCMove, this);

        // group.angle = 180;
        // group.x = winW;
        // group.y = winH;
        

    };
    this.update = function(){
        game.physics.arcade.overlap(hand, myhand, this.onHit, null, this);
        leftTimeText.text = time;
    }
    this.onHit = (a, b) => {
        if(hitted){
            return;
        }
        hitPic.visible = true;
        hitted = true;
        game.time.events.add(Phaser.Timer.SECOND * 1, function(){
            game.state.start('over')
        }, this);
        
    }
    this.NPCMove = () => {
        var rnd = Math.random();
        if(rnd <= 0.5){
            if(isHitting || hitted || isHiding){
                // console.log('正在躲不能打')
                return;
            }
            isHitting = true;
            hand.play('hit',4,false);
            hitAnim.onComplete.add(()=>{
                hit.start()
            }, this);
        }else {
            if(isHitting || hitted){
                return;
            }
            scare.start()
        }
    }
}; 

game.States.over = function(){
    this.create = () =>{
        var bg = game.add.tileSprite(0,0, winW, winH,'bg');
        var tipBg = game.add.sprite(game.world.centerX,game.world.centerY,'boom')
        tipBg.anchor.setTo(0.5,0.5);
        tipBg.scale.setTo(1.3);
        tipBg.inputEnabled = true;
        tipBg.events.onInputDown.add(()=>{
            game.state.start('main')
        }, this);

        var tooltip = game.add.text(game.world.centerX,game.world.centerY + 20, "", { font: "bold 32px Microsoft Yahei", fill: "#999", align: "center" });
        if(hitted){
            tooltip.setText('回去再练三十年\nOK?');
        }else{
            tooltip.setText('单身三十年的手速\n朕自愧不如');
        }
        tooltip.anchor.setTo(0.5,0.5);
    }
}

game.state.add('main', game.States.main);
game.state.add('over', game.States.over);

game.state.start('main');
