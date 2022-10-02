const carts = require('./carts');

class Game{
    constructor(roomName, id){
        this.carts = carts;
        this.players = [];
        this.game = []
        this.ost = [];
        this.zot = null;
        this.a = 0;
        this.trash = [];
        this.randomdefuser = 0;
        this.roomId = Date.now();
        this.roomName = roomName;
        this.gamearea = [];
        this.chat = [];
        this.creator = id;
        this.started = false;
    }

    // game

    StartGame(){
        this.started = true;
        let gamearray = [];
        this.game = []
        this.ost = [];
        this.zot = {};
        this.a = 0;
        let currentind = this.carts.length, randind;

        while(currentind != 0){
            randind = Math.floor(Math.random() * currentind);
            currentind--;
            [this.carts[currentind], this.carts[randind]] = [this.carts[randind], this.carts[currentind]]
        }

        for(let i=0;i<this.carts.length;i++){
            if(this.carts[i].pos >= 1 && this.carts[i].pos <= 4) continue;

            // if(this.carts[i].pos == 0) this.carts[i].pos = 13;
            // gamearray.push({ ...this.carts[i], show: false });
            gamearray.push(this.carts[i]);
        }

        for(let i=0;i<this.players.length;i++){
            this.players[i].carts = [];
            for(let j=0;j<6;j++){
                this.players[i].carts.push(gamearray[this.a]);
                this.a++;
            }
        }

        this.randomdefuser = Math.floor(Math.random()*this.players.length);
        this.players[this.randomdefuser].def = true;

        this.zot = gamearray[this.a];
        this.zot.show = true;
        this.a++;

        this.ost.push(this.zot);
        for(let i=this.a;i<gamearray.length;i++){
            this.ost.push(gamearray[i]);
        }
    }

    Game(cart, player){
        this.players.find(pl => pl.id === player.id).carts = player.carts;
        this.gamearea.push({...cart, answ: null});
    }

    Def(id, cart, player){
        this.players.find(pl => pl.id === player.id).carts = player.carts;
        this.gamearea.find(a => a.id === id).answ = cart;
    }

    GetAllCards(id){
        this.gamearea.forEach(({answ, ...cart}) => {
            if(answ){
                this.players.find(pl => pl.id === id).carts.push(cart, answ);
            }else{
                this.players.find(pl => pl.id === id).carts.push(cart);
            }
        })
        this.Next()
    }

    Next(){
        this.gamearea = [];
        for(let i=0;i<this.players.length;i++){
            if(this.ost.length === 0) break
            if(this.players[i].carts.length < 6){
                while(this.players[i].carts.length < 6){
                    this.players[i].carts.push(this.ost[this.ost.length-1])
                    this.ost.pop();
                }
            }else{
                continue;
            }
        }
        this.players[this.randomdefuser].def = false;
        this.randomdefuser++;
        if(this.randomdefuser >= this.players.length) this.randomdefuser = 0;
        this.players[this.randomdefuser].def = true;
    }

    // user  

    register(name, id){
        if(this.started || this.players.length === 6) return;
        this.players.push({
            id,
            name,
            carts: [],
            def: false
        })
    }

    disconnectuser(id){
        this.players = this.players.filter(p => p.id !== id)
        if(this.creator === id) {
            this.creator = this.players[0]?.id
            this.roomName = this.players[0]?.name
        };
    }

    // chat
    sendMessage(id, name, text){
        this.chat.push({
            id,
            name,
            text,
        })
    }
}

module.exports = Game