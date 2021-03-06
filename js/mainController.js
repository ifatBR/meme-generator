'use strict';
var gElCanvas;
var gCtx;
var gElDownloadLink;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gCurrFont = 'impact';
var gCurrSearchWord;
var gIsDownload = false;
var gCurrColor = '#cc2e2e';
var gCurrRatio = 1;
var gIsDragging = false;
var gIsScaling = false;
var gStartPos;

function init() {
    initKeyWords();
    renderGallery();
    initStickers();
    renderStickers();
}

function initTxtCtrls() {
    document.querySelector('.color input').value = '#cc2e2e';
    gCurrFont = 'impact';
    document.querySelector('.select-font').value = gCurrFont;
    resetLines();
}

function onSwitchLines() {
    switchLines();
    renderCanvas();
}

function onMoveSelected(moveDiff) {
    moveSelectedYAxis(moveDiff);
    renderCanvas();
}

function onAddLine() {
    addNewLine(gElCanvas.width, gElCanvas.height, gCurrColor, gCurrFont);
    document.querySelector('.stroke').classList.add('on');

    emptyMemeTxtInput();
    renderCanvas();
}

function onDelete() {
    deleteCurr();
    renderCanvas();
}

function onEditMemeText(elTextInput) {
    const txt = elTextInput.value;
    updateMemeTxt(txt, gElCanvas.width, gElCanvas.height, gCurrColor, gCurrFont);
    renderCanvas();
}

function updateMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = getSelectedLineTxt();
}

function emptyMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = '';
}

function onChangeSize(sizeDiff) {
    changeSelectedSize(sizeDiff);
    renderCanvas();
}

function onChangeAlign(align) {
    changeAlign(align, gElCanvas.width);
    renderCanvas();
}

function onChangeFont(elSelectFont) {
    gCurrFont = elSelectFont.value;
    updateSelectedLineFont(gCurrFont);
    renderCanvas();
}

function onToggleStroke() {
    document.querySelector('.stroke').classList.toggle('on');
    toggleStroke();
    renderCanvas();
}

function onSelectColor(elColorInput) {
    const color = elColorInput.value;
    changeColor(color);
    renderCanvas();
}

function renderStickers() {
    let stickers = getStickers();
    const strHtml = stickers.map((sticker) => `<img src="${sticker.url}" onclick="onAddSticker('${sticker.id}')">`).join('');
    document.querySelector('.stickers').innerHTML = strHtml;
}

function onAddSticker(stickerId) {
    const sticker = getStickerById(stickerId);
    const img = new Image();
    img.src = sticker.url;
    const ratio = (img.height / img.width);    
    addNewSticker(stickerId, gElCanvas.width, gElCanvas.height, ratio);
    emptyMemeTxtInput();
    renderCanvas();
}

function onChanePage(pageDiff) {
    changeStickersPage(pageDiff);
    renderStickers();
}

function renderCanvas() {
    const img = new Image();
    img.src = getImgSrc();
    img.onload = () => {
        gCurrRatio = img.height / img.width;
        resizeCanvas();
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
        addMemesText();
        addMemesStickers();
        setTimeout(showFocusBorder, 10);
    };
}

function addMemesText() {
    const lines = getAllLines();

    lines.forEach((line, idx) => {
        const { txt, pos } = line;
        const fontFam = line.font;
        document.fonts.load('40px ' + fontFam).then(() => {
            if (line.isStroke) {
                gCtx.strokeStyle = line.color;
                gCtx.fillStyle = 'white';
            } else {
                gCtx.fillStyle = line.color;
                gCtx.strokeStyle = 'transparent';
            }
            gCtx.lineWidth = 1;
            const fontSize = line.size + 'px';
            gCtx.font = fontSize + ' ' + fontFam;
            gCtx.textAlign = line.align;
            gCtx.fillText(txt, pos.x, pos.y);
            gCtx.strokeText(txt, pos.x, pos.y);
            updateTxtWidth(idx, gCtx.measureText(txt).width);
        });
    });
}

function addMemesStickers() {
    const currStickers = getMemeStickers();
    currStickers.forEach((sticker, idx) => {
        const { src, width, height,pos } = sticker;
        const img = new Image();
        img.src = src;
        gCtx.drawImage(img, pos.x, pos.y, width, height);
    });
}

function showFocusBorder() {
    const borderParams = getBorderParams();
    if (!borderParams) return;
    const { xStart, yStart, w, h, scalePntPos} = borderParams;
    gCtx.beginPath();
    gCtx.rect(xStart, yStart, w, h);
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = 'white';
    gCtx.stroke();
    showScalePnt(scalePntPos);
}

function showScalePnt(pos) {
    gCtx.beginPath();
    gCtx.arc(pos.x,pos.y,7,0,2*Math.PI)
    gCtx.fillStyle = '#0f9ab4';
    gCtx.fill();
}

function resizeCanvas() {
    const elContainerHeilo = document.querySelector('.canvas-container-heilo');
    const elContainer = document.querySelector('.canvas-container');
    const canvasContainerH = elContainer.offsetWidth * gCurrRatio;
    elContainerHeilo.style.height = canvasContainerH + 'px';
    gElCanvas.width = elContainer.offsetWidth;
    gElCanvas.height = canvasContainerH;
}

//Gallery functions

function onToggleMemesMenu() {
    if (document.body.classList.contains('open-menu')) onToggleMenu();
    document.body.classList.toggle('open-memes');
    renderSavedMemes();
}

function renderSavedMemes() {
    const savedMemes = getSavedMemes();
    let strHtml = '<h2>My saved memes</h2>';
    strHtml += savedMemes
        .map((meme) => {
            return `<img src="${meme.imgContent}" data-id="${meme.id}" onclick="onClickSavedMeme(event,this)">`;
        })
        .join('');
    document.querySelector('.memes').innerHTML = strHtml;
}

function onToggleAboutModal() {
    if (document.body.classList.contains('open-menu')) onToggleMenu();
    document.body.classList.toggle('open-about');
}

function onOpenGallery() {
    if (document.body.classList.contains('open-menu')) onToggleMenu();
    else if (document.body.classList.contains('open-memes')) onToggleMemesMenu();
    let elGallery = document.querySelector('.gallery-container');
    if (!elGallery.classList.contains('hide')) return;

    emptyMemeTxtInput();
    resetSelections();
    document.body.classList.add('show-gallery');
    elGallery.classList.remove('hide');
    document.querySelector('.meme-editor').classList.add('hide');
    gCurrSearchWord = null;
}

function renderGallery() {
    let allImgs = getImgs();
    let strHtml =
        '<div class="file-input-container img-item"><h2>Choose your own image!</h2><input type="file" class="img-item file-input btn" name="image" onchange="onImgInput(event)"/></div>';
    strHtml += allImgs
        .map((img) => {
            return `<img class="img-item" src="${img.url}" onclick="onChooseImg(${img.id})" />`;
        })
        .join('');

    document.querySelector('.img-container').innerHTML = strHtml;
    renderKeyWords();
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
    let basicSize = 12;
    if (screenWidth > 1080) {
        amount = 15;
    } else if (screenWidth > 630) amount = 12;
    else {
        amount = 9;
        basicSize = 10;
    }
    const trandyKeywordsArr = Object.entries(getKeywords()).slice(0, amount);
    const trandyKeywords = Object.fromEntries(trandyKeywordsArr);
    let strHtml = '';

    for (const word in trandyKeywords) {
        const fontSize = trandyKeywords[word] >= 24 ? 24 : basicSize + trandyKeywords[word];
        strHtml += `<li class="keyword"><a href="#"  onclick="onClickSearchWord('${word}')" 
        style="font-size:${fontSize}px">${word}</a></li>`;
    }

    document.querySelector('.trandy-words').innerHTML = strHtml;
}

function onToggleMoreWords() {
    document.body.classList.toggle('more-menu');
}

function onClickSearchWord(searchWord) {
    updateSearchWord(searchWord);
    renderKeyWords();
    renderGallery();
}

function onSearchImg(ev) {
    ev.preventDefault();
    const searchWord = document.querySelector('.search').value;
    document.querySelector('.search').value = '';
    updateSearchWord(searchWord);
    renderGallery();
}

function onChooseImg(idx = -1, imgSrc) {
    initTxtCtrls();
    setMemeImg(idx, imgSrc);
    document.body.classList.remove('show-gallery');
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.meme-editor').classList.remove('hide');
    gElCanvas = document.getElementById('main-canvas');
    gCtx = gElCanvas.getContext('2d');
    addListeners();
    renderCanvas();
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
    const {isDragging, isScaling} = isDraggingOrScaling(pos);
    gIsDragging = isDragging;
    gIsScaling = isScaling;
    renderCanvas();
    updateMemeTxtInput();
    gStartPos = pos;
    document.body.style.cursor = 'grabbing';
}

function onMove(ev) {
    if(!gIsDragging && !gIsScaling) return;
    const pos = getEvPos(ev);
    if (gIsDragging) {
        moveSelectedByDragging(pos, gStartPos);
        gStartPos = pos;
        renderCanvas();
        return
    }
    scaleSelectedByDragging(pos, gStartPos);
    gStartPos = pos;
    renderCanvas();

}

function onUp() {
    gIsDragging = gIsScaling = false;
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

function onDownloadImg() {
    resetSelections();
    renderCanvas();
    setTimeout(setDownloadLink, 700);
}

function setDownloadLink() {
    const imgContent = gElCanvas.toDataURL('image/jpeg');
    const strHtml = `<a href="${imgContent}" class="btn start-action" download="Awesomeme" 
    onclick="onCloseDownloadShareModal()">Click to download</a>`;
    toggleModalScreen(strHtml);
}

function uploadImg(elForm, ev) {
    ev.preventDefault();
    resetSelections();
    renderCanvas();
    document.getElementById('imgData').value = gElCanvas.toDataURL('image/jpeg');

    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        uploadedImgUrl = encodeURIComponent(uploadedImgUrl);
        const strHtml = `
        <a class="btn start-action" href="https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}" 
        title="Share on Facebook" target="_blank" onclick="onCloseDownloadShareModal();
        window.open('https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}'); return false;">
        Click to share on facebook   
        </a>`;
        toggleModalScreen(strHtml);
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

function onSaveImg() {
    resetSelections();
    renderCanvas();
    setTimeout(setSaveLink, 700);
}

function setSaveLink() {
    const imgContent = gElCanvas.toDataURL('image/jpeg');
    addToSavedMemes(imgContent);
    const strHtml = `<a class="btn start-action">Meme has been saved</a>  <div class="modal-btns-container flex space-between"><button onClick="onCloseDownloadShareModal()">Close</button></div`;
    toggleModalScreen(strHtml);
}

function onClickSavedMeme(ev, elImg) {
    ev.stopPropagation();
    const strHtml = `<a href="${elImg.src}" class="btn start-action meme-action" download="Awesomeme" 
    onClick="onCloseDownloadShareModal()">Download meme</a>
    <a href="#" class="btn start-action meme-action"
    onClick="onDeleteMeme('${elImg.dataset.id}')">Delete meme</a>`;
    toggleModalScreen(strHtml);
}

function onDeleteMeme(memeId) {
    toggleModalScreen();
    const strHtml = `<h2 class="btn start-action">Are you sure?</h2> <div class="modal-btns-container flex space-between"><button onClick="onRemoveMeme('${memeId}')">Yes</button> <button onClick="onCloseDownloadShareModal()">No!</button></div>`;
    toggleModalScreen(strHtml);
}

function onRemoveMeme(id) {
    removeSavedMeme(id);
    renderSavedMemes();
    onCloseDownloadShareModal();
}

function onCloseDownloadShareModal() {
    toggleModalScreen();
}

function toggleModalScreen(strHtml) {
    if (strHtml) document.querySelector('.download-share.modal').innerHTML = strHtml;
    document.body.classList.toggle('open-modal');
}

function onImgInput(ev) {
    loadImgFromInput(ev);
}

function loadImgFromInput(ev) {
    document.querySelector('.share-container').innerHTML = '';
    var reader = new FileReader();

    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        onChooseImg(-1, event.target.result);
    };
    reader.readAsDataURL(ev.target.files[0]);
}
