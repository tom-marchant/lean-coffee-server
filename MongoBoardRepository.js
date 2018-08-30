import mongoose from 'mongoose'

const DATABASE_URL = 'mongodb://192.168.99.100:3001/lean-coffee-machine'
		
const Board = mongoose.model('Board', { 
	id: {
		type: Number,
		unique: true
	},
	cardSequence: Number,
	cards: [
		{ 
			id: Number,
			content: String
		}
	]
});

export default class MongoBoardRepository {
	constructor() {
		mongoose.set('useCreateIndex', true)
		mongoose.connect(DATABASE_URL, { useNewUrlParser: true }).then(
			() => { console.log(`Connected successfully to ${DATABASE_URL}`) },
			err => { console.log("Failed to connect", err) }
		)
		
		this.db = mongoose.connection;
	}
	
	create(id = getRandomInt(1000)) {
		const board = new Board({ 
			id: id,
			cardSequence: 0,
			cards: []
		});
		
		board.save().then(() => console.log(`Created board with ID ${id}`));
	}
	
	getAll() {
		return Board.find({}, 'id cardSequence cards').exec()
	}
	
	get(id) {
		Kitten.find({ id: id }, callback);
		return boards[id]
	}
	
	addCard(id, content) {
		const board = get(id)
		const cardId = board.cardSequence++
		const card = {
			"id": cardId,
			"content": content
		}
		
		board.cards.push(card)
		return card
	}
	
	updateCard(boardId, cardId, content) {

	}
	
	deleteCard(boardId, cardId) {

	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}