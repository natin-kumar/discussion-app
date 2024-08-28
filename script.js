const submitbtn = document.getElementById('submitbtn');
const second = document.querySelector('.second');
const subject = document.getElementById('subject');
const question = document.getElementById('question');
const data = document.querySelector('.data');
const formbtn = document.getElementById('formbtn');
const QuestResponse = document.querySelector('.QuestResponse');
const subjectResponse = document.getElementById('subjectResponse');
const questionResponse = document.getElementById('questionResponse');
const responses = document.querySelector('.responses');
const submitResponse = document.getElementById('submitResponse');
const resolve = document.getElementById('resolve');
const times = document.querySelectorAll('.time');
let localdata=JSON.parse(localStorage.getItem('questions')) || [];

loadQuestions();

function createQuestionDOM(sub, body, id, isFavorite = false) {
    const newdiv = document.createElement('div');
    newdiv.classList.add('child');
    newdiv.id = id;
    newdiv.addEventListener('click', () => questionId(newdiv));
    newdiv.innerHTML = `
        <h2 class='dynamic_h2'>${sub}</h2>
        <p class='dynamic_p'>${body}</p>
        <img src="${isFavorite ? 'colorStar.png' : 'blankstar.jpeg'}" class="bstar" alt="favourite">
        <span class="time"></span>
    `;
    
    const blankstar = newdiv.querySelector('.bstar'); 
    blankstar.addEventListener('click', (event) => {
        event.stopPropagation(); 
        if (blankstar.src.endsWith("blankstar.jpeg")) {
            blankstar.src = "colorStar.png";
            moveToTop(newdiv);
            updateLocalStorage(id, true);
        } else {
            blankstar.src = "blankstar.jpeg";
            moveToBottom(newdiv);
            updateLocalStorage(id, false);
        }
    });
    return newdiv;
}

function timeSince(seconds) {
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds > 10) return Math.floor(seconds) + " seconds ago";
    return "few sec ago";
}

function updateTime() {
    
    localdata.forEach((ele) => {
        const seconds = Math.floor((Date.now() - ele.time) / 1000);
        const timeString = timeSince(seconds);
        const questionElement = document.getElementById(ele.id);
        if (questionElement) {
            const timeElement = questionElement.querySelector('.time');
            if (timeElement) timeElement.innerText = timeString;
        }
    });
}

setInterval(updateTime, 1000);
updateTime();

function moveToTop(element) {
    const parent = element.parentNode;
    parent.removeChild(element);
    parent.insertBefore(element, parent.firstChild);
}

function moveToBottom(element) {
    const parent = element.parentNode;
    parent.removeChild(element);
    parent.appendChild(element);
}

function updateLocalStorage(id, isFavorite) {
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    const updatedQuestions = questions.map(question => {
        if (question.id === id) question.favorite = isFavorite;
        return question;
    });
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
}

function loadQuestions() {
    
    localdata.forEach(question => {
        const questionDiv = createQuestionDOM(question.sub, question.body, question.id, question.favorite);
        second.appendChild(questionDiv);
        if (question.favorite) moveToTop(questionDiv);
    });
}

function searchQuestion() {
    let input = document.getElementById('searchQuestion').value.toLowerCase();
    const child = second.querySelectorAll('.child');
    child.forEach(child => {
        const h = child.querySelector('h2');
        const p = child.querySelector('p');
        const heading = child.querySelector('h2').innerText;
        const para = child.querySelector('p').innerText;
        if (heading.toLowerCase().includes(input) || para.toLowerCase().includes(input)) {
            h.innerHTML = heading.replace(new RegExp(input, 'gi'), match => `<mark>${match}</mark>`);
            p.innerHTML = para.replace(new RegExp(input, 'gi'), match => `<mark>${match}</mark>`);
            child.style.display = 'block';
        } else {
            child.style.display = 'none';
        }
    });
}
function addQuestion(sub, body) {
    // const id = `ques${counter}`;
    const id= Date.now();
    const newdiv = createQuestionDOM(sub, body, id);
    const children = second.querySelectorAll('.child');
    let lastIndex = -1;
    children.forEach((child, index) => {
        const notFav = child.querySelector('.bstar').src;
        if (notFav.endsWith('colorStar.png')) {
            lastIndex = index;
        }
    });
    if (lastIndex !== -1) {
        second.insertBefore(newdiv, children[lastIndex + 1]);
    } else {
        second.insertBefore(newdiv, second.firstChild);
    }
    const object = {
        sub: sub,
        body: body,
        id: id,
        responses: [],
        favorite: false, 
        time: Date.now()
    };
    // counter++;
    localdata.push(object);
    localStorage.setItem('questions', JSON.stringify(localdata));
}

function addResponse(name, comment) {
    const id = Date.now();
    const newdiv = createResponseDOM(name, comment, id);
    responses.insertBefore(newdiv, responses.firstChild);

    const responseObject = {
        resName: name,
        comm: comment,
        id: id,
        like: 0,
        dislike: 0,
        netlike: 0
    };

    localdata.forEach((ele) => {
        if (ele.id == quesid.id) ele.responses.push(responseObject);
    });

    localStorage.setItem('questions', JSON.stringify(localdata));
    // responseCounter++;
    clearInputs(document.getElementById('responseName'), document.getElementById('comment'));
}

function checkinput(sub, body) {
    return sub.value.trim() === "" || body.value.trim() === "";
}

formbtn.addEventListener('click', () => {
    clearInputs(subject, question);
    toggleDisplay(data, QuestResponse);
});

function clearInputs(...inputs) {
    inputs.forEach(input => input.value = "");
}

function toggleDisplay(showElement, hideElement) {
    hideElement.style.display = 'none';
    showElement.style.display = 'block';
}

function questionId(qId) {
    quesid = qId;
    const child1 = qId.querySelector('.dynamic_h2');
    const child2 = qId.querySelector('.dynamic_p');

    toggleDisplay(QuestResponse, data);

    subjectResponse.innerText = child1.innerText;
    questionResponse.innerText = child2.innerText;
    
    loadResponses(qId.id);
}

function loadResponses(questionId) {
    responses.innerHTML = '';
    const question = localdata.find(q => q.id == questionId);
    // console.log(question,questionId);
    question.responses.forEach(response => {
        const newdiv = createResponseDOM(response.resName, response.comm, response.id, response.like, response.dislike);
        responses.appendChild(newdiv);
    });
}

function createResponseDOM(name, comment, id, like = 0, dislike = 0) {
    const newdiv = document.createElement('div');
    newdiv.id = id;
    newdiv.classList.add('clickQuestion');
    newdiv.innerHTML = `
        <h2 class="response_h2">${name}</h2>
        <p class="response_p">${comment}</p>
        <img src="like.png" class="like">
        <span class="likeCounter">${like}</span>
        <img src="dislike.png" class="dislike">
        <span class="dislikeCounter">${dislike}</span>
    `;
    // console.log(id);
    const likeBtn = newdiv.querySelector('.like');
    const dislikeBtn = newdiv.querySelector('.dislike');
    likeBtn.addEventListener('click', () => updateLikeDislike(id, true));
    dislikeBtn.addEventListener('click', () => updateLikeDislike(id, false));
    return newdiv;
}

function updateLikeDislike(responseId, isLike) {

    localdata.forEach(question => {
        if (question.responses) {
            question.responses.forEach(response => {
                if (response.id === responseId) {
                    if (isLike) {
                        response.like++;
                    } else {
                        response.dislike++;
                    }
                    response.netlike = response.like - response.dislike;
                }
            });
            question.responses.sort((a, b) => b.netlike - a.netlike);
        }
    });
    localStorage.setItem('questions', JSON.stringify(localdata));
    loadResponses(quesid.id);
}

resolve.addEventListener('click', () => {
    const index = localdata.findIndex(q => q.id == quesid.id);
    if (index !== -1) {
        localdata.splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(localdata));
        quesid.parentNode.removeChild(quesid);
        quesid = null;
        clearInputs(subject, question);
        toggleDisplay(data, QuestResponse);
    }
});
submitbtn.addEventListener('click', () => {
    if (checkinput(subject, question)) {
        alert("Please Enter Valid Data");
    } else {
        addQuestion(subject.value, question.value);
        subject.value = "";
        question.value = "";
    }
});

submitResponse.addEventListener('click', () => {
    const responseName = document.getElementById('responseName');
    const comment = document.getElementById('comment');
    if (checkinput(responseName, comment)) {
        alert("Please Enter Valid Data");
    } else {
        addResponse(responseName.value, comment.value);
    }
});
// let counter = localdata.length + 1;
// let responseCounter = 1;
let quesid;
