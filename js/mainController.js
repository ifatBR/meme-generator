'use strict';
var gElCanvas;
var gCtx;
var gCurrLineIdx = 0;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];

function init() {
    initImageGallery();
    gElCanvas = document.getElementById('main-canvas');
    gCtx = gElCanvas.getContext('2d');
    addListeners();
    drawImgFromlocal();
    //TODO:  resizeCanvas()
    //TODO: add event listener
}

function initImageGallery() {
    createImageGallery();
}

function onChooseImg(id) {
    updateMemeImage(id);
    drawImgFromlocal();
}

function onEditMemeText(elTextInput, lnIdx) {
    const txt = elTextInput.value;
    updateMemeTxt(lnIdx, txt);
    drawImgFromlocal();
}

function onChangeFontSize(sizeDiff) {
    changeFontSize(gCurrLineIdx, sizeDiff);
    drawImgFromlocal();
}

function drawImgFromlocal() {
    const img = new Image();
    img.src = getImgSrc();
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height); //img,x,y,xend,yend
        const txt1 = getLnObjectById(0).txt;
        const txt2 = getLnObjectById(1).txt;

        addMemeText(0, txt1, 200, 40);
        addMemeText(1, txt2, 200, 360);
    };
}

function addMemeText(lnIdx, text, x, y) {
    const lnObj = getLnObjectById(lnIdx);
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = 'red';
    gCtx.fillStyle = 'white';
    const fontSize = lnObj.size + 'px';
    gCtx.font = fontSize + ' impact';
    gCtx.textAlign = lnObj.align;
    gCtx.fillText(text, x, y);
    gCtx.strokeText(text, x, y);
    updateTxtWidth(lnIdx, gCtx.measureText(text).width);
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
    if (getClickedLine(pos)) console.log('line clicked!');
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
    // document.body.style.cursor = 'grab'
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

function isLineClicked(clickedPos) {
    // const { pos } = gCircle
    // const distance = Math.sqrt((pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2)
    // return distance <= gCircle.size
}
