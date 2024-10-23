const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'quiz_platform'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});


app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };

    db.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('Username already exists.');
            }
            return res.status(500).send('Server error.');
        }
        res.status(201).send({ id: result.insertId, username });
    });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).send('Server error.');
        if (results.length === 0) return res.status(401).send('Invalid username or password.');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).send('Invalid username or password.');

        res.send({ id: user.id, username: user.username });
    });
});

app.post('/quizzes', (req, res) => {
    const quiz = { title: req.body.title };
    db.query('INSERT INTO quizzes SET ?', quiz, (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, ...quiz });
    });
});

app.get('/quizzes', (req, res) => {
    db.query('SELECT * FROM quizzes', (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post('/questions', (req, res) => {
    const question = {
        quiz_id: req.body.quiz_id,
        question_text: req.body.question_text,
        options: JSON.stringify(req.body.options),
        correct_option: req.body.correct_option
    };
    db.query('INSERT INTO questions SET ?', question, (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, ...question });
    });
});

app.get('/quizzes/:id/questions', (req, res) => {
    db.query('SELECT * FROM questions WHERE quiz_id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
