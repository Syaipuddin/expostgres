import express from 'express'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config();
const Pool = pg.Pool;
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
})

const app = express();

app.use(express.json());

// GET ALL USERS
app.get('/users', (req, res) => {
    pool.query('SELECT * FROM users', (error, results) => {
        if(error){
            throw new Error(`Error at ${error}`)
        }
        res.json(results.rows);
    })
})

// GET USER BY ID
app.get('/user/:id', (req, res) => {
    const { id } = req.params;

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if(error){
            throw error;
        }

        res.json(results.rows);
    })
})

// ADD NEW USERS
app.post('/user/new', (req, res) => {

    const { name, email } = req.body;

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
        if(error){
            throw error;
        }

        res.status(201).json(results.rows)
    })
})

// UPDATE USERS
app.patch('/user/update/:id', (req, res) => {

    const { id } = req.params;
    const { name, email } = req.body
    
    pool.query('SELECT * FROM users WHERE id=$1', [id], (error, results) => {
        if(error){
            res.status(500).json({error : error})
        }

        pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name || results.rows[0]?.name, email || results.rows[0]?.email, id], (error, result) => {
            if(error){
                res.status(500).json({error : error});
            }
    
            res.status(201).json({ message : `User with ${id} successfully Modified`})
        })
    })
   
})

app.delete('/user/delete/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {

        if(error){
            res.status(500).json({error : error});
        }

        res.status(201).json({ message : `User with ${id} successfully Deleted`})
    })
})

app.listen('3000', () => {
    console.log('Connected!')
})