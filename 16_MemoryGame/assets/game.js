const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    button: document.querySelector('.button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let index = 0; index < items; index++) {

        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])

        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}


const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    if (dimensions % 2 !== 0) {
        throw new Error("Количество клеток должно быть четным")
    }

    const images = ['img/1.png',
                    'img/2.png',
                    'img/3.png',
                    'img/4.png',
                    'img/5.png',
                    'img/6.png',
                    'img/7.png',
                    'img/8.png'];  
       
    const picks = pickRandom(images, (dimensions * dimensions) / 2) 

    const items = shuffle([...picks, ...picks])

    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card-main" value="0">
                    <div class="card-front"></div>
                    <div class="card-back"><img class="card-main" src="${item}"></div>
                </div>
            `).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
    selectors.button.classList.add('stopped')
}

const stopGame = () => {

    state.gameStarted = false
    selectors.button.classList.remove('started')
    selectors.button.classList.add('stopped')
    selectors.button.innerText = 'Старт'
    flipBackAllCards();   
}

const startGame = () => {
    state.gameStarted = true
    selectors.button.classList.remove('stopped')
    selectors.button.classList.add('started')
    selectors.button.innerText = 'Стоп'
    state.totalTime = 0
    state.totalFlips = 0
    clearInterval(state.loop)

    flipAllCards();

    state.loop = setInterval(() => {
        state.totalTime++

        if (state.gameStarted){
        selectors.moves.innerText = `Выполнено ${state.totalFlips} попыток`
        selectors.timer.innerText = `Затрачено времени: ${state.totalTime} секунд`
        }
    }, 1000)
}

const flipBackCards = () => {
    document.querySelectorAll('.card-main:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })
    state.flippedCards = 0
}

const flipBackAllCards = () => {
    document.querySelectorAll('.card-main').forEach(card => {
        card.classList.add('flipped')
    })
    state.flippedCards = 16
}

const flipAllCards = () => {
    document.querySelectorAll('.card-main').forEach(card => {
        card.classList.remove('flipped')
    })
    state.flippedCards = 0
}



const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {

        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerHTML === flippedCards[1].innerHTML) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');

            flippedCards[0].setAttribute('value', '1');
            flippedCards[1].setAttribute('value', '1');
        }

        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
    else {
        setTimeout(() => {
            flipBackCards()
        }, 2000)
    }

    const c = document.querySelectorAll('div[value]:not([value="1"])').length

    if (!document.querySelectorAll('div[value]:not([value="1"])').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    Вы победили!<br />
                    с результатом <span class="highlight">${state.totalFlips}</span> попыток<br />
                    за <span class="highlight">${state.totalTime}</span> секунд
                </span>
            `
            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {

            flipCard(eventParent)

            } 
        else if (eventTarget.className.includes('button') && eventTarget.className.includes('stopped')) {

                generateGame()

                startGame()                
            } 
        else if (eventTarget.className.includes('button') && eventTarget.className.includes('started')) {

                stopGame()
            }
        })
}


generateGame()

attachEventListeners()