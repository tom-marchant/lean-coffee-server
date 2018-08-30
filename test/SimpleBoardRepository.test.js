import SimpleBoardRepository from '../SimpleBoardRepository'

test('creates and fetches a new board', async() => {
	const repository = new SimpleBoardRepository()
	const expectedNewBoard = {
		id: 1,
		cardSequence: 0,
		cards: []
	}
	
	await expect(repository.create(1)).resolves.toEqual(expectedNewBoard)
});

test('adds cards to board', async() => {
	const repository = new SimpleBoardRepository()
	await repository.create(1)
	
	expect(repository.addCard(1, 'stuff')).resolves.toEqual({
		id: 0,
		content: 'stuff'
	})
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(1)
	})
	
	expect(repository.addCard(1, 'more stuff')).resolves.toEqual({
		id: 1,
		content: 'more stuff'
	})
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(2)
	})
});

test('updates a card on the board', async() => {
	const repository = new SimpleBoardRepository()
	await repository.create(1)
	
	await repository.addCard(1, 'stuff')
	await repository.addCard(1, 'more stuff')
	
	await repository.updateCard(1, 1, 'edited')
	
	await repository.get(1).then((board) => {
		expect(board.cards[0].content).toBe('stuff')
		expect(board.cards[1].content).toBe('edited')
	})
});

test('deletes a card on the board', async() => {
	const repository = new SimpleBoardRepository()
	await repository.create(1)
	
	await repository.addCard(1, 'stuff')
	await repository.addCard(1, 'more stuff')
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(2)
	})
	
	await repository.deleteCard(1, 0)
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(1)
		expect(board.cards[0].content).toBe('more stuff')
	})
});

test('does not re-use old card IDs', async() => {
	const repository = new SimpleBoardRepository()
	await repository.create(1)
	
	await repository.addCard(1, 'stuff')
	await repository.addCard(1, 'more stuff')
	await repository.addCard(1, 'blah')
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(3)
		expect(board.cards.map(card => card.id)).toEqual([0, 1, 2])
	})
	
	await repository.deleteCard(1, 1)	// should delete second card
	await repository.deleteCard(1, 1) 	// should do nothing
	
	await repository.get(1).then((board) => {
		expect(board.cards.length).toBe(2)
	})
	
	await repository.addCard(1, 'hiya').then(async(newCard) => {
		await repository.get(1).then((board) => {
			expect(board.cards.length).toBe(3)
			expect(board.cards.map(card => card.id)).toEqual([0, 2, 3])
		})
	})
});
