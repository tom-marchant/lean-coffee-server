import express from 'express'
import morgan from 'morgan'
import SimpleBoardRepository from './SimpleBoardRepository'
import MongoBoardRepository from './MongoBoardRepository'
import bodyParser from 'body-parser';

//const mongoRepo = new MongoBoardRepository()
//mongoRepo.create()
//mongoRepo.getAll().then((boards) => {
//	console.log("Fetched all boards: ", boards)
//})

const app = express()
const repository = new SimpleBoardRepository()

app.use(morgan('dev')) // Logging
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

app.get('/', function (req, res) {
	res.send('Hi. Create a new board with a POST to /v1/boards')
});

var router = express.Router()
app.use('/v1/boards/', router);

router.use(function(req, res, next) {
    //console.log(req.body);
    next();
});

router.route('/')
	.post(function (req, res) {
		repository.create(1).then((newBoard) => {
			res.status(201).json(newBoard)
		})
	})
	.get(function (req, res) {
		repository.getAll().then((boards) => res.json(boards))
	});

router.route('/:board_id')
	.get(function (req, res) {
		const id = req.params.board_id
		tryAndGetBoard(id, res).then((board) => {
			if (board)
				res.json(board)
		})
	});
	
router.route('/:board_id/cards')
	.post(function (req, res) {
		const id = req.params.board_id
		
		tryAndGetBoard(id, res).then((board) => {
			if (board) {
				const content = req.body.content
				const newCard = repository.addCard(id, content)
		
				res.status(201).json(newCard)
			}
		})
	});
	
router.route('/:board_id/cards/:card_id')	
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
	.delete(function (req, res) {
		const boardId = req.params.board_id
		tryAndGetBoard(boardId, res).then((board) => {
			if (board) {
				repository.deleteCard(req.params.board_id, req.params.card_id)
				res.send()
			}
		})
	});

app.listen(3000, () => console.log('App listening on port 3000'))

