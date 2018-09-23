import express from 'express'
import BoardRouter from '../Routes'
import request from 'supertest'
import bodyParser from 'body-parser'
import MongoBoardRepository from '../MongoBoardRepository'

let mockGetAllBoards, mockCreateBoard, mockGetBoard, mockAddCard, mockUpdateCard, mockDeleteCard

class MockRepository {
	create(id) {
		return mockCreateBoard(id)
	}
	get(id) {
		return mockGetBoard(id)
	}
	getAll() {
		return mockGetAllBoards()
	}
	addCard(boardId, content) {
		return mockAddCard(boardId, content)
	}
	updateCard(boardId, cardId, content) {
		return mockUpdateCard(boardId, cardId, content)
	}
	deleteCard(boardId, cardId) {
		return mockDeleteCard(boardId, cardId)
	}
}

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', new BoardRouter(new MockRepository()).createRouter())

function createDefaultMocks() {
	mockGetAllBoards = jest.fn(() => Promise.resolve([{id:1, cards:[]}, {id:2, cards:[]}]));
	mockCreateBoard = jest.fn(() => Promise.resolve({id:1, cards:[]}));
	mockGetBoard = jest.fn(() => Promise.resolve({id:1, cards:[{id:1, content: 'new content'}]}));
	mockAddCard = jest.fn(() => Promise.resolve({id:1, content: 'new content'}));
	mockUpdateCard = jest.fn(() => Promise.resolve({id:1, content: 'updated content'}));
	mockDeleteCard = jest.fn(() => Promise.resolve());
}

beforeEach(() => {	
	createDefaultMocks()
})

test('creates a new board without specifying ID', async() => {
	await request(app)
		.post('/')
		.expect(201)
		.then(response => {
			expect(mockCreateBoard.mock.calls.length).toBe(1);
			expect(response.body).toEqual({
				id: 1,
				cards: []
			})
		})
})

test('creates a new board with a given ID', async() => {
	await request(app)
		.post('/')
		.send({id: 12345})
		.expect(201)
		.then(response => {
			expect(mockCreateBoard.mock.calls.length).toBe(1);
			expect(mockCreateBoard).toBeCalledWith(12345)
		})
})

test('fetches all boards', async() => {
	await request(app)
		.get('/')
		.expect(200)
		.then(response => {
			expect(mockGetAllBoards.mock.calls.length).toBe(1);
			expect(response.body).toEqual([{id:1, cards:[]}, {id:2, cards:[]}])
		})
})

test('fetches a single board', async() => {
	await request(app)
		.get('/1')
		.expect(200)
		.then(response => {
			expect(mockGetBoard.mock.calls.length).toBe(1);
			expect(mockGetBoard).toBeCalledWith("1");
			expect(response.body).toEqual({id:1, cards:[{id:1, content: 'new content'}]})
		})
})

test('returns 404 when trying to fetch a non-existent board', async() => {
	mockGetBoard = jest.fn(() => Promise.resolve());
	
	await request(app)
		.get('/nope')
		.expect(404)
		.then(response => {
			expect(mockGetBoard.mock.calls.length).toBe(1);
			expect(mockGetBoard).toBeCalledWith("nope");
			expect(response.body.code).toEqual("board.not.found")
		})
})

test('adds a new card', async() => {
	await request(app)
		.post('/1/cards')
		.send({content: 'card content'})
		.expect(201)
		.then(response => {
			expect(mockAddCard.mock.calls.length).toBe(1);
			expect(mockAddCard).toBeCalledWith('1', 'card content');
			expect(response.body).toEqual({id:1, content: 'new content'})
		})
})

test('fails with bad request error when trying to create a new card with no content', async() => {
	await request(app)
		.post('/1/cards')
		.send({})
		.expect(400)
		.then(response => {
			expect(response.body.code).toEqual("card.content.missing.or.empty")
		})
		
	await request(app)
		.post('/1/cards')
		.send({content: ''})
		.expect(400)
		.then(response => {
			expect(response.body.code).toEqual("card.content.missing.or.empty")
		})
		
})

test('updates a card', async() => {
	await request(app)
		.put('/1/cards/1')
		.send({content: 'updated content'})
		.expect(204)
		.then(response => {
			expect(mockUpdateCard.mock.calls.length).toBe(1);
			expect(mockUpdateCard).toBeCalledWith('1', 1, 'updated content');
			expect(response.body).toEqual({})
		})
})

test('fails with bad request error when trying to update a card to have no content', async() => {
	await request(app)
		.put('/1/cards/1')
		.send({})
		.expect(400)
		.then(response => {
			expect(response.body.code).toEqual("card.content.missing.or.empty")
		})
		
	await request(app)
		.put('/1/cards/1')
		.send({content: ''})
		.expect(400)
		.then(response => {
			expect(response.body.code).toEqual("card.content.missing.or.empty")
		})
		
})

test('returns 404 when trying to update non-existent card', async() => {
	await request(app)
		.put('/1/cards/2')
		.send({content: 'updated content'})
		.expect(404)
		.then(response => {
			expect(response.body.code).toEqual("card.not.found")
		})
})

test('deletes a card', async() => {
	await request(app)
		.delete('/1/cards/1')
		.expect(204)
		.then(response => {
			expect(mockDeleteCard.mock.calls.length).toBe(1);
			expect(mockDeleteCard).toBeCalledWith('1', 1);
			expect(response.body).toEqual({})
		})
})