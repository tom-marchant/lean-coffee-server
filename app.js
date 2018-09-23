import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import expressSwaggerGenerator from 'express-swagger-generator'
import BoardRouter from './Routes'
import MongoBoardRepository from './MongoBoardRepository'
import timeout from 'connect-timeout'

const app = express()

app.use(morgan('dev')) // Logging
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(timeout('10s'))

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

let swaggerOptions = {
    swaggerDefinition: {
        info: {
            description: 'Create and update Lean Coffee boards',
            title: 'Lean Coffee Server',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/v1',
        produces: [
            "application/json"
        ],
        schemes: ['http']
    },
    basedir: __dirname,
    files: ['./Routes.js'] 
};

const expressSwagger = expressSwaggerGenerator(app)
expressSwagger(swaggerOptions)

app.get('/', function (req, res) {
	res.redirect('/api-docs')
});

const repository = new MongoBoardRepository()
const router = new BoardRouter(repository).createRouter()

app.use('/v1/boards/', router);
app.use(haltOnTimedout)

app.listen(3000, () => console.log('App listening on port 3000'))

