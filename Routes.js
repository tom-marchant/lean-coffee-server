import express from 'express'
import MongoBoardRepository from './MongoBoardRepository'
//import SimpleBoardRepository from './SimpleBoardRepository'

class ApiError {
	constructor(code, message) {
		this.code = code
		this.message = message
	}
}

function tryAndGetBoard(id, res) {
	return new Promise((resolve, reject) => {
		repository.get(id).then((board) => {
			if (board) {
				resolve(board)
			} else {
				res.status(404).json(new ApiError(
					"board.not.found", 
					`Couldn't find board with ID ${id}`)
				)
				resolve()
			}
		})
	})
}

const repository = new MongoBoardRepository()
const router = express.Router()

router.use(function(req, res, next) {
    //console.log(req.body);
    next();
});

router.route('/')
	/**
	 * Create a new board
	 *
	 * @route POST /boards
	 * @group boards - Operations about boards
	 * @param {NewBoardRequest.model} newBoardRequest.body - ID for the new board. Leave blank to assign a random ID
	 * @returns {Board.model} 201 - The new board
	 */
	.post(function (req, res) {
		const id = req.body.id
		
		repository.create(id).then((newBoard) => {
			res.status(201).json(newBoard)
		})
	})
	
	/**
	 * Fetch all existing boards
	 *
	 * @route GET /boards
	 * @group boards - Operations about boards
	 * @returns {Array.<Board>} 200 - All the boards
	 */
	.get(function (req, res) {
		repository.getAll().then((boards) => res.json(boards))
	});

router.route('/:board_id')
	/**
	 * Fetches a single board
	 *
	 * @route GET /boards/{board_id}
	 * @group boards - Operations about boards
	 * @param {string} board_id.path.required - The board ID
	 * @returns {Board.model} 200 - The matching board
	 * @returns {ApiError.model} 404 - No matching board found
	 */
	.get(function (req, res) {
		const id = req.params.board_id
		tryAndGetBoard(id, res).then((board) => {
			if (board)
				res.json(board)
		})
	});
	
router.route('/:board_id/cards')
	/**
	 * Adds a new card to a board
	 *
	 * @route POST /boards/{board_id}/cards
	 * @group cards - Operations about cards
	 * @param {string} board_id.path.required - The board ID
	 * @param {NewCardRequest.model} newCardRequest.body.required - The text content of the card
	 * @returns {Card.model} 201 - The new card
	 * @returns {ApiError.model} 404 - No matching board found
	 */
	.post(function (req, res) {
		const id = req.params.board_id
		
		tryAndGetBoard(id, res).then((board) => {
			if (board) {
				const content = req.body.content
				repository.addCard(id, content).then((newCard) => {
					res.status(201).json(newCard)
				})
			}
		})
	});
	
router.route('/:board_id/cards/:card_id')
	/**
	 * Updates an existing card
	 *
	 * @route PUT /boards/{board_id}/cards/{card_id}
	 * @group cards - Operations about cards
	 * @param {string} board_id.path.required - The board ID
	 * @param {string} card_id.path.required - The card ID
	 * @param {UpdateCardRequest.model} updateCardRequest.body.required - The text content of the card
	 * @returns 204 - Card updated successfully
	 * @returns {ApiError.model} 404 - No matching board found
	 * @returns {ApiError.model} 404 - No matching card found
	 */
	.put(function (req, res) {
		const boardId = req.params.board_id
		tryAndGetBoard(boardId, res).then((board) => {
			if (board) {
				const content = req.body.content
				repository.updateCard(boardId, req.params.card_id, content).then(() => {
					res.status(204).send()
				})
			}
		})
	})
	/**
	 * Deletes an existing card
	 *
	 * @route DELETE /boards/{board_id}/cards/{card_id}
	 * @group cards - Operations about cards
	 * @param {string} board_id.path.required - The board ID
	 * @param {string} card_id.path.required - The card ID
	 * @returns {Card} 204 - Delete was successful
	 * @returns {ApiError} 404 - No matching board found
	 * @returns {ApiError} 404 - No matching card found
	 */
	.delete(function (req, res) {
		const boardId = req.params.board_id
		tryAndGetBoard(boardId, res).then((board) => {
			if (board) {
				repository.deleteCard(req.params.board_id, req.params.card_id).then(() => {
					res.status(204).send()
				})
			}
		})
	});
	
	export default router
	
/**
 * @typedef Board
 * @property {string} id.required
 * @property {Array.<Card>} cards.required - List of cards
 */
 
 /**
 * @typedef NewBoardRequest
 * @property {string} id - ID to assign to the new board
 */
 
 /**
 * @typedef NewCardRequest
 * @property {string} content.required - Text content of the card
 */
 
  /**
 * @typedef UpdateCardRequest
 * @property {string} content.required - Text content of the card
 */
 
 /**
 * @typedef Card
 * @property {integer} id.required
 * @property {string} content.required - Text content of the card
 */
 
/**
 * @typedef ApiError
 * @property {string} code.required
 * @property {string} message.required
 */