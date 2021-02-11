'use strict';
var gElCanvas;
var gCtx;
var gCurrLnIdx;
var gElDownloadLink;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gFont = 'impact';
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
    resizeCanvas();
    // setTimeout(renderCanvas,5000);
}

function onAddLine() {
    createNewLine(gElCanvas.width / 2);
    gCurrLnIdx = getLinesCount() - 1;
    emptyMemeTxtInput();
    renderCanvas();
}

function onDeleteLine() {
    deleteLine(gCurrLnIdx);
    gCurrLnIdx = 0;
    emptyMemeTxtInput();
    if (getLinesCount() === 0) gCurrLnIdx = undefined;
    renderCanvas();
}

function onEditMemeText(elTextInput) {
    if (gCurrLnIdx === undefined) return;
    const txt = elTextInput.value;
    updateMemeTxt(gCurrLnIdx, txt);
    renderCanvas();
}
// function onEditMemeText(elTextInput, lnIdx) {
//     const txt = elTextInput.value;
//     updateMemeTxt(lnIdx, txt);
//     renderCanvas();
// }

function onChangeFontSize(sizeDiff) {
    changeFontSize(gCurrLnIdx, sizeDiff);
    renderCanvas();
}

function onChangeAlign(align) {
    changeAlign(gCurrLnIdx, align, gElCanvas.width);
    renderCanvas();
}

function onChangeFont(elSelectFont) {
    gFont = elSelectFont.value;
    renderCanvas();
}

function onAddUnderline() {
    const lnObj = getLnObjectById(gCurrLnIdx);
    const { x, y, width } = lnObj;
    gCtx.beginPath();
}

function onSelectColor(elColorInput) {
    const color = elColorInput.value;
    console.log(color);
    if (gCurrLnIdx === undefined) return;
    changeColor(gCurrLnIdx, color);
    renderCanvas();
}


function onDownloadImg(elLink) {
    gCurrLnIdx = undefined;
    renderCanvas(true);
    var imgContent = gElCanvas.toDataURL('image/jpeg');
    elLink.href = imgContent;
}

function renderCanvas(isDownload = false) {
    const img = new Image();
    img.src = getImgSrc();
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        addMemesText();
        if (!isDownload && gCurrLnIdx >= 0) showFocusBorder(gCurrLnIdx);
    };
}

function addMemesText() {
    const lnsObjs = getAllLines();
    lnsObjs.forEach((lnObj, lnIdx) => {
        const { txt, x, y } = lnObj;
        gCtx.lineWidth = 1;
        const fontSize = lnObj.size + 'px';
        gCtx.font = fontSize + ' ' + gFont;
        gCtx.textAlign = lnObj.align;
        gCtx.strokeStyle = lnObj.color;
        gCtx.fillStyle = 'white';
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

    let widthOffst = -width;
    if (lnObj.align === 'left') widthOffst = 0;
    else if (lnObj.align === 'center') widthOffst = -width / 2;

    gCtx.rect(x + widthOffst - 5, y - size * 1.25, width + 10, size * 1.75);
    gCtx.strokeStyle = 'white';
    gCtx.stroke();
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container');
    gElCanvas.width = elContainer.offsetWidth;
    gElCanvas.height = elContainer.offsetHeight;
}

function updateMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = getLnObjectById(gCurrLnIdx).txt;
}

function emptyMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = '';
}
//Gallery functions
function onOpenGallery() {
    document.querySelector('.gallery-container').classList.remove('hide');
    document.querySelector('.meme-editor').classList.add('hide');
    if (document.body.classList.contains('open-menu')) onToggleMenu();
}

function onSearchImg(ev) {
    ev.preventDefault();
    const searchWords = document.querySelector('.search').value;
    console.log(searchWords);
}

function onToggleMenu() {
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
    updateMemeTxtInput();
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
