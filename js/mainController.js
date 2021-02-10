'use strict';
var gElCanvas;
var gCtx;
var gCurrLnIdx = 0;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];

function init() {
    initImageGallery(); 
}

function initImageGallery() {
    createImageGallery();
}

function onChooseImg(id) {
    updateMemeImage(id);
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.meme-editor').classList.remove('hide');
    gElCanvas = document.getElementById('main-canvas');
    gCtx = gElCanvas.getContext('2d');
    addListeners();

    renderCanvas();
    resizeCanvas()
    // setTimeout(renderCanvas,5000);
}

function onEditMemeText(elTextInput, lnIdx) {
    const txt = elTextInput.value;
    updateMemeTxt(lnIdx, txt);
    renderCanvas();
}

function onChangeFontSize(sizeDiff) {
    changeFontSize(gCurrLnIdx, sizeDiff);
    renderCanvas();
}

function renderCanvas() {
    const img = new Image();
    img.src = getImgSrc();
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        addMemesText();
        showFocusBorder(gCurrLnIdx)
    };
}

function addMemesText() {
    const lnsObjs = getAllLines();
    lnsObjs.forEach((lnObj, lnIdx) => {
        const { txt, x, y } = lnObj;
        gCtx.lineWidth = 1;
        gCtx.strokeStyle = 'red';
        gCtx.fillStyle = 'white';
        const fontSize = lnObj.size + 'px';
        gCtx.font = fontSize + ' impact';
        gCtx.textAlign = lnObj.align;
        gCtx.fillText(txt, x, y);
        gCtx.strokeText(txt, x, y);
        updateTxtWidth(lnIdx, gCtx.measureText(txt).width);
    });
}

function onMoveCurrLn(moveDiff) {
    moveLineY(gCurrLnIdx, moveDiff);
    renderCanvas();
}

function updateCurrLine(lnIdx) {
    if (lnIdx < 0) return;
    // removeFocusBorder(gCurrLnIdx)
    gCurrLnIdx = lnIdx;
    renderCanvas();
}


function showFocusBorder(lnIdx) {
    const lnObj = getLnObjectById(lnIdx);
    const { x, y, size, width } = lnObj;
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.rect((x - width / 2) - 5, (y-size) -3, width + 10, size + 10);
    gCtx.strokeStyle = 'white';
    gCtx.stroke();
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container');
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

//Gallery functions
function onOpenGallery(){
    document.querySelector('.gallery-container').classList.remove('hide');
    document.querySelector('.meme-editor').classList.add('hide');
    if(document.body.classList.contains('open-menu')) onToggleMenu();
}

function onSearchImg(ev){
    ev.preventDefault();
    const searchWords = document.querySelector('.search').value;
    console.log(searchWords);
}

function onToggleMenu(){
    document.body.classList.toggle('open-menu');
}

//For when I want to add download
function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL();
    elLink.href = data;
    elLink.download = 'my-img.jpg';
}

//LISTENERS
function addListeners() {
    addMouseListeners();
    addTouchListeners();
    window.addEventListener('resize', () => {
        resizeCanvas();
        renderCanvas();
    });
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove);

    gElCanvas.addEventListener('mousedown', onDown);

    gElCanvas.addEventListener('mouseup', onUp);
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove);

    gElCanvas.addEventListener('touchstart', onDown);

    gElCanvas.addEventListener('touchend', onUp);
}

function onDown(ev) {
    const pos = getEvPos(ev);
    const clickedLineIdx = getClickedLine(pos);
    if (clickedLineIdx === undefined) return;
    updateCurrLine(clickedLineIdx);
    // if (!isCirlceClicked(pos)) return
    // gCircle.isDragging = true
    // gStartPos = pos
    document.body.style.cursor = 'grabbing';
}

function onMove(ev) {
    // if (gCircle.isDragging) {
    //     const pos = getEvPos(ev)
    //     const dx = pos.x - gStartPos.x
    //     const dy = pos.y - gStartPos.y
    //     gCircle.pos.x += dx
    //     gCircle.pos.y += dy
    //     gStartPos = pos
    //     renderCanvas()
    //     renderCircle()
    // }
}

function onUp() {
    // gCircle.isDragging = false
    document.body.style.cursor = 'grab';
}

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    };
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault();
        ev = ev.changedTouches[0];
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        };
    }
    return pos;
}

