import mongoose from 'mongoose'

const DATABASE_URL = 'mongodb://192.168.99.100:3001/lean-coffee-machine'

const connectionOptions = {
	useNewUrlParser: true, 
	useCreateIndexes: true,
	connectTimeoutMS: 10000
}

// Schemas		
const Board = mongoose.model('Board', { 
	id: {
		type: String,
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
		mongoose.connect(DATABASE_URL, connectionOptions).then(
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
		
		return new Promise((resolve, reject) => {
			board.save().then(() => {
				console.log(`Created board with ID ${id}`)
				resolve(board)
			}, (err) => reject(err));
		})
	}
	
	getAll() {
		return Board.find({}, 'id cardSequence cards').exec()
	}
	
	get(id) {
		return Board.findOne({ id: id }).exec()
	}
	
	addCard(id, content) {
		return new Promise((resolve, reject) => {
			this.get(id).then((board) => {
				const cardId = board.cardSequence++
				
				const card = {
					"id": cardId,
					"content": content
				}
				
				board.cards.push(card)
				
				board.save().then((updatedBoard, err) => {
					if (err) 
						reject (err)
					else
						resolve(card)
				})
			})
		})
	}
	
	updateCard(boardId, cardId, content) {
		return new Promise((resolve, reject) => {
			this.get(boardId).then((board) => {
				let card = getCardWithId(board.cards, cardId)
				
				if (card) {
					card.content = content
					return board.save()
				} else {
					// what?
				}
				
			}).then((updatedBoard, err) => {
				if (err) 
					reject(err)
				else
					resolve()
			})
		})
	}
	
	deleteCard(boardId, cardId) {
		return new Promise((resolve, reject) => {
			this.get(boardId).then((board) => {
				const cardIndex = board.cards.findIndex(card => { return card.id == cardId})
		
				if (cardIndex >= 0) {
					board.cards.splice(cardIndex, 1)
					board.save().then(() => resolve())
					
				} else {
					// error, no such card to delete
					resolve()
				}
			})
		})
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getCardWithId(cards, cardId) {
	return cards.find(card => card.id == cardId)
}