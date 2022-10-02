let rooms = [];
const Game = require('./Game')

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.emit('get-rooms', rooms)
        socket.emit('get-id', socket.id)

        socket.on('create-room', (name) => {
            const game = new Game(name, socket.id);
            game.register(name, socket.id)
            rooms.push(game);
            socket.emit('get-created-room', game)
            io.emit('get-rooms', rooms)
            socket.join(game.roomId)
        })

        socket.on('join-room', ({name, id}) => {
            const game = rooms.find(gm => gm.roomId === id);
            
            if(!game.started){
                game.register(name, socket.id)
                
                socket.join(id)
                io.to(id).emit('receive-mess', {id, text: `${name} гнида попал в игру`, name: null})
    
                io.to(id).emit('get-resources', game)
            }
        })

        socket.on('start-game', (id) => {
            const game = rooms.find(gm => gm.roomId === id);
            
            game.StartGame(socket.id)
            game.sendMessage({id, text: `Да начнётся дерьмо`, name: null})

            io.to(id).emit('receive-mess', {id, text: `Да начнётся дерьмо`, name: null})

            io.to(id).emit('get-resources', game)
        });

        socket.on('run-cart', ({id, cart, player}) => {
            const game = rooms.find(gm => gm.roomId === id);
            game.Game(cart, player)
            io.to(id).emit('get-resources', game)
        })

        socket.on('def-cart', ({id, cartId, cart, player}) => {
            const game = rooms.find(gm => gm.roomId === id);
            game.Def(cartId, cart, player)
            io.to(id).emit('get-resources', game)
        })

        socket.on('get-game-cards', (id) => {
            const game = rooms.find(gm => gm.roomId === id);
            game.GetAllCards(socket.id)
            io.to(id).emit('get-resources', game)
        });

        socket.on('next-round', (id) => {
            const game = rooms.find(gm => gm.roomId === id);
            game.Next()
            io.to(id).emit('get-resources', game)
        })

        socket.on('send-mess', (data) => {
            const { rmId, ...mdata } = data;
            const game = rooms.find(gm => gm.roomId === rmId);
            
            game.StartGame(socket.id)

            io.to(rmId).emit('receive-mess', mdata)
        });

        socket.on('clear-room', () => {rooms = []})
    
        socket.on('disconnect', () => {
            const game = rooms.find(gm => gm.players.find(pl => pl.id === socket.id));
            if(!game) return;
            game.disconnectuser(socket.id)
            io.to(game.roomId).emit('receive-mess', {id: game.roomId, text: `${game.roomName} гнида ушел с игру`, name: null})
            io.to(game.roomId).emit('get-resources', game)
            if(game.players.length === 0){
                rooms = rooms.filter(gm => gm.roomId !== game.roomId)
                io.emit('get-rooms', rooms)
                delete game
            }
        })
    });
}