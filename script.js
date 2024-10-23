const apiUrl = 'http://localhost:3000';

async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Signup successful! You can now login.');
        window.location.href = 'login.html'; 
    } else {
        const errorMessage = await response.text();
        alert(`Signup failed: ${errorMessage}`);
    }
}


async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const user = await response.json();
        alert(`Welcome back, ${user.username}!`);
        window.location.href = 'quiz.html'; 
    } else {
        const errorMessage = await response.text();
        alert(`Login failed: ${errorMessage}`);
    }
}


async function createQuiz() {
    const title = document.getElementById('quiz-title').value;
    const response = await fetch(`${apiUrl}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    const quiz = await response.json();
    alert(`Quiz created with ID: ${quiz.id}`);
    loadQuizzes();
}

async function loadQuizzes() {
    const response = await fetch(`${apiUrl}/quizzes`);
    const quizzes = await response.json();
    const quizList = document.getElementById('quiz-list');
    const quizSelect = document.getElementById('quiz-select');

    quizList.innerHTML = '';
    quizSelect.innerHTML = '<option value="">Select a Quiz</option>'; 

    quizzes.forEach(quiz => {
        const li = document.createElement('li');
        li.textContent = quiz.title;
        quizList.appendChild(li);

        const option = document.createElement('option');
        option.value = quiz.id;
        option.textContent = quiz.title;
        quizSelect.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const quizSelect = document.getElementById('quiz-select');
    const startQuizButton = document.getElementById('start-quiz');
    const quizQuestionsDiv = document.getElementById('quiz-questions');
    const questionsContainer = document.getElementById('questions-container');
    const quizTitle = document.getElementById('quiz-title');

    // Fetch quizzes
    async function fetchQuizzes() {
        const response = await fetch(`${apiUrl}/quizzes`);
        const quizzes = await response.json();
        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.title;
            quizSelect.appendChild(option);
        });
    }

    // Load quiz questions
    startQuizButton.addEventListener('click', async () => {
        const quizId = quizSelect.value;
        if (quizId) {
            const response = await fetch(`${apiUrl}/quizzes/${quizId}/questions`);
            const questions = await response.json();
            quizTitle.textContent = questions[0].quizTitle;
            questionsContainer.innerHTML = ''; // Clear previous questions

            questions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.innerHTML = `<p>${question.question}</p>`;
                question.options.forEach(option => {
                    const label = document.createElement('label');
                    label.innerHTML = `
                        <input type="radio" name="question-${question.id}" value="${option}"> ${option}
                    `;
                    questionDiv.appendChild(label);
                });
                questionsContainer.appendChild(questionDiv);
            });

            quizQuestionsDiv.style.display = 'block';
        }
    });

    fetchQuizzes();
});

async function addQuestion() {
    const quizId = prompt('Enter Quiz ID:');
    const questionText = document.getElementById('question-text').value;
    const options = document.getElementById('options').value.split(',');
    const correctOption = parseInt(document.getElementById('correct-option').value);
    
    const response = await fetch(`${apiUrl}/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
    });

    if (!response.ok) {
        throw new Error('Failed to add question');
    }

    const question = await response.json();
    return question;
}

async function loadQuestions() {
    const quizId = document.getElementById('quiz-select').value;
    const quizQuestionsDiv = document.getElementById('quiz-questions');
    quizQuestionsDiv.innerHTML = '';
    document.getElementById('submit-quiz').style.display = 'none'; 

    if (quizId) {
        const response = await fetch(`${apiUrl}/quizzes/${quizId}/questions`);
        const questions = await response.json();

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `<p>${index + 1}. ${question.question_text}</p>`;
            const options = JSON.parse(question.options);

            options.forEach((option, optionIndex) => {
                questionDiv.innerHTML += `
                    <input type="radio" name="question${index}" value="${optionIndex}"> ${option}<br>
                `;
            });

            quizQuestionsDiv.appendChild(questionDiv);
        });

        document.getElementById('submit-quiz').style.display = 'block'; 
    }
}

async function submitQuiz() {
    const quizId = document.getElementById('quiz-select').value;
    const quizQuestionsDiv = document.getElementById('quiz-questions');
    const questions = quizQuestionsDiv.querySelectorAll('div');
    let score = 0;

    for (let i = 0; i < questions.length; i++) {
        const selectedOption = questions[i].querySelector(`input[name="question${i}"]:checked`);
        if (selectedOption) {
            const selectedIndex = parseInt(selectedOption.value);
            const response = await fetch(`${apiUrl}/quizzes/${quizId}/questions`);
            const questionData = await response.json();
            if (selectedIndex === questionData[i].correct_option) {
                score++;
            }
        }
    }

    alert(`You scored ${score} out of ${questions.length}`);
}

window.onload = () => {
    if (window.location.pathname.endsWith('quiz.html')) {
        loadQuizzes();
    }
};
function generateQuestionInputs() {
    const count = document.getElementById('question-count').value;
    const questionInputsDiv = document.getElementById('question-inputs');
    questionInputsDiv.innerHTML = ''; 

    for (let i = 0; i < count; i++) {
        questionInputsDiv.innerHTML += `
            <h3>Question ${i + 1}</h3>
            <input type="text" id="question-text-${i}" placeholder="Question Text">
            <input type="text" id="options-${i}" placeholder="Options (comma separated)">
            <input type="number" id="correct-option-${i}" placeholder="Correct Option Index">
        `;
    }
}

async function addAllQuestions() {
    const count = document.getElementById('question-count').value;
    for (let i = 0; i < count; i++) {
        const questionText = document.getElementById(`question-text-${i}`).value;
        const options = document.getElementById(`options-${i}`).value.split(',');
        const correctOption = parseInt(document.getElementById(`correct-option-${i}`).value);

        const quizId = prompt('Enter Quiz ID for these questions:');
        
        const response = await fetch(`${apiUrl}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizId,
                question_text: questionText,
                options,
                correct_option: correctOption
            })
        });
        const question = await response.json();
        alert(`Question ${i + 1} added with ID: ${question.id}`);
    }
}

function logout() {
    localStorage.removeItem('username');

    window.location.href = 'index.html';
}
if (quiz.id) {
    alert(`Quiz "${quiz.title}" created with ID: ${quiz.id}`);
}
