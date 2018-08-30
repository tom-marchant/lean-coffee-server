let boards = {}

export default class SimpleBoardRepository {
	
	create(id = getRandomInt(1000)) {
		boards[id] = {
			"id": id,
			"cardSequence": 0,
			"cards": []
		}
		
		return Promise.resolve(boards[id])
	}
	
	getAll() {
		return Promise.resolve(boards)
	}
	
	get(id) {
		return Promise.resolve(boards[id])
	}
	
	addCard(id, content) {
		const board = boards[id]
		const cardId = board.cardSequence++
		const card = {
			"id": cardId,
			"content": content
		}
		
		board.cards.push(card)
		return Promise.resolve(card)
	}
	
	updateCard(boardId, cardId, content) {
		const card = findCardWithId(boards[boardId].cards, cardId)
		
		if (card)
			card.content = content
		
		return Promise.resolve()
	}
	
	deleteCard(boardId, cardId) {
		const cards = boards[boardId].cards
		const cardIndex = cards.findIndex(card => { return card.id == cardId})
		
		if (cardIndex >= 0) {
			cards.splice(cardIndex, 1)
			boards[boardId].cards = cards
		}
		
		return Promise.resolve()
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function findCardWithId(cards, id) {
	return cards.find(card => card.id == id)
}