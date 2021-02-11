'use strict';
var gElCanvas;
var gCtx;
var gCurrLnIdx;
var gElDownloadLink;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gCurrFont = 'impact';
var gCurrSearchWord;
var gIsDownload = false;
var gCurrColor = '#cc2e2e';
var gCurrRatio = 1;
var gIsDragging = false;
var gStartPos;
function init() {
    initKeyWords();
    renderGallery();
}

function onAddLine() {
    createNewLine(gElCanvas.width / 2, gCurrColor);
    gCurrLnIdx = getLinesCount() - 1;
    emptyMemeTxtInput();
    renderCanvas();
}

function onDeleteLine() {
    if (gCurrLnIdx === undefined) return;
    deleteLine(gCurrLnIdx);
    gCurrLnIdx = 0;
    emptyMemeTxtInput();
    if (getLinesCount() === 0) gCurrLnIdx = undefined;
    renderCanvas();
}

function onMoveCurrLn(moveDiff) {
    if (gCurrLnIdx === undefined) return;
    moveLineY(gCurrLnIdx, moveDiff);
    renderCanvas();
}

function updateCurrLine(lnIdx) {
    if (lnIdx < 0) return;
    gCurrLnIdx = lnIdx;
    renderCanvas();
}

function onEditMemeText(elTextInput) {
    if (gCurrLnIdx === undefined) onAddLine();
    const txt = elTextInput.value;
    updateMemeTxt(gCurrLnIdx, txt);
    renderCanvas();
}

function addMemesText() {
    const lnsObjs = getAllLines();

    lnsObjs.forEach((lnObj, lnIdx) => {
        const { txt, x, y } = lnObj;
        const fontFam = lnObj.font;

        document.fonts.load('40px ' + fontFam).then(() => {
            if (lnObj.isStroke) {
                gCtx.strokeStyle = lnObj.color;
                gCtx.fillStyle = 'white';
            } else {
                gCtx.fillStyle = lnObj.color;
                gCtx.strokeStyle = 'transparent';
            }
            gCtx.lineWidth = 1;
            const fontSize = lnObj.size + 'px';
            gCtx.font = fontSize + ' ' + fontFam;
            gCtx.textAlign = lnObj.align;
            gCtx.fillText(txt, x, y);
            gCtx.strokeText(txt, x, y);
            updateTxtWidth(lnIdx, gCtx.measureText(txt).width);
        });
    });
}

function updateMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = getLnObjectByIdx(gCurrLnIdx).txt;
}

function emptyMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = '';
}

function onChangeFontSize(sizeDiff) {
    if (gCurrLnIdx === undefined) return;
    changeFontSize(gCurrLnIdx, sizeDiff);
    renderCanvas();
}

function onChangeAlign(align) {
    if (gCurrLnIdx === undefined) return;
    changeAlign(gCurrLnIdx, align, gElCanvas.width);
    renderCanvas();
}

function onChangeFont(elSelectFont) {
    gCurrFont = elSelectFont.value;
    const lnObj = getLnObjectByIdx(gCurrLnIdx);
    lnObj.font = gCurrFont;
    if (gCurrLnIdx === undefined) return;
    renderCanvas();
}

function onToggleStroke() {
    if (gCurrLnIdx === undefined) return;
    const lnObj = getLnObjectByIdx(gCurrLnIdx);
    lnObj.isStroke = !lnObj.isStroke;
    renderCanvas();
}

function onSelectColor(elColorInput) {
    const color = elColorInput.value;
    gCurrColor = color;
    if (gCurrLnIdx === undefined) return;
    changeColor(gCurrLnIdx, color);
    renderCanvas();
}

function renderCanvas() {
    const img = new Image();
    img.src = getImgSrc();
    gCurrRatio = calculateImgRatio(img);
    // resizeCanvas();

    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        addMemesText();
        setTimeout(showFocusBorder, 5);
    };
}

function showFocusBorder() {
    if (gCurrLnIdx === undefined) return;
    const lnObj = getLnObjectByIdx(gCurrLnIdx);
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
    const elContainerHeilo = document.querySelector('.canvas-container-heilo');
    const elContainer = elContainerHeilo.querySelector('.canvas-container');
    const canvasContainerH = elContainer.offsetWidth * gCurrRatio;

    elContainerHeilo.style.height = canvasContainerH + 'px';
    gElCanvas.width = elContainer.offsetWidth;
    gElCanvas.height = canvasContainerH;
}

//Gallery functions

function onOpenGallery() {
    emptyMemeTxtInput();
    gCurrLnIdx = undefined;
    document.querySelector('.gallery-container').classList.remove('hide');
    document.querySelector('.meme-editor').classList.add('hide');
    gCurrSearchWord = null;
    if (document.body.classList.contains('open-menu')) onToggleMenu();
}

function renderGallery() {
    let allImgs = getImages();
    if (gCurrSearchWord && gCurrSearchWord !== 'all') allImgs = getRelevantImgs(allImgs);

    let strHtml = allImgs
        .map((img) => {
            return `<img class="img-item" src="${img.url}" onclick="onChooseImg(${img.id})" />`;
        })
        .join('');

    document.querySelector('.img-container').innerHTML = strHtml;
    renderKeyWords();
}

function calculateImgRatio(img) {
    return img.height / img.width;
}

function initKeyWords() {
    updateKeywords();
    renderWordsList();
}

function renderWordsList() {
    const allWords = getKeywords();
    let strHtml = Object.keys(allWords)
        .map((word) => `<option value="${word}"></option>`)
        .join('');
    document.querySelector('#search-words').innerHTML = strHtml;
}

function renderKeyWords() {
    const screenWidth = window.innerWidth;
    let amount;
    if (screenWidth > 1080) amount = 15;
    else if (screenWidth > 630) amount = 12;
    else amount = 9;
    const trandyKeywordsArr = Object.entries(getKeywords()).slice(0, amount);
    const trandyKeywords = Object.fromEntries(trandyKeywordsArr);
    let strHtml = '';
    for (const word in trandyKeywords) {
        const fontSize = trandyKeywords[word] >= 24 ? 24 : 12 + trandyKeywords[word];
        strHtml += `<li class="keyword"><a href="#"  onclick="onClickSearchWord('${word}')" 
        style="font-size:${fontSize}px">${word}</a></li>`;
    }

    document.querySelector('.trandy-words').innerHTML = strHtml;
}

function onToggleMoreWords() {
    document.body.classList.toggle('more-menu');
}

function getRelevantImgs(allImgs) {
    return allImgs.filter((img) => img.keywords.includes(gCurrSearchWord));
}

function onClickSearchWord(word) {
    increaseWordRate(word);
    gCurrSearchWord = word;
    renderGallery();
}

function onSearchImg(ev) {
    ev.preventDefault();
    gCurrSearchWord = document.querySelector('.search').value;
    document.querySelector('.search').value = '';
    renderGallery();
}

function onChooseImg(id) {
    resetLines();
    setMemeImage(id);
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.meme-editor').classList.remove('hide');
    gElCanvas = document.getElementById('main-canvas');
    gCtx = gElCanvas.getContext('2d');
    addListeners();
    renderCanvas();
    resizeCanvas();
}

function onToggleMenu() {
    document.body.classList.toggle('open-menu');
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
    if (clickedLineIdx === undefined) return;
    gIsDragging = true;
    gStartPos = pos;
    document.body.style.cursor = 'grabbing';
}

function onMove(ev) {
    if (gIsDragging) {
        const lnObj = getLnObjectByIdx(gCurrLnIdx);
        const pos = getEvPos(ev);
        const dx = pos.x - gStartPos.x;
        const dy = pos.y - gStartPos.y;
        lnObj.x += dx;
        lnObj.y += dy;
        gStartPos = pos;
        renderCanvas();
    }
}

function onUp() {
    gIsDragging = false;
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

//Download& share

// on submit call to this function
function uploadImg(elForm, ev) {
    ev.preventDefault();
    document.getElementById('imgData').value = gElCanvas.toDataURL('image/jpeg');

    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        uploadedImgUrl = encodeURIComponent(uploadedImgUrl);
        document.querySelector('.download-share.modal').classList.remove('hide');
        toggleModalScreen();

        document.querySelector('.download-share.modal').innerHTML = `
        <a class="btn start-action" href="https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}" title="Share on Facebook" target="_blank" onclick="onCloseDownloadShareModal();window.open('https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}'); return false;">
        Click to share on facebook   
        </a>`;
    }

    doUploadImg(elForm, onSuccess);
}

function doUploadImg(elForm, onSuccess) {
    var formData = new FormData(elForm);
    fetch('//ca-upload.com/here/upload.php', {
        method: 'POST',
        body: formData,
    })
        .then(function (res) {
            return res.text();
        })
        .then(onSuccess)
        .catch(function (err) {
            console.error(err);
        });
}

function onDownloadImg() {
    gCurrLnIdx = undefined;
    renderCanvas();
    document.querySelector('.download-share.modal').classList.remove('hide');
    setTimeout(showDownloadShareModal, 700);
}

function showDownloadShareModal() {
    toggleModalScreen();
    var imgContent = gElCanvas.toDataURL('image/jpeg');
    const strHtml = `<a href="${imgContent}" class="btn start-action" download="Awesomeme" onClick="onCloseDownloadShareModal()">Click to download</a>`;
    document.querySelector('.download-share.modal').innerHTML = strHtml;
}

function onCloseDownloadShareModal() {
    toggleModalScreen();
    document.querySelector('.download-share.modal').classList.add('hide');
    gCurrLnIdx = getLinesCount() ? 0 : undefined;
}

function toggleModalScreen() {
    document.body.classList.toggle('open-modal');
}
