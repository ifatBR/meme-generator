'use strict';
var gElCanvas;
var gCtx;
var gCurrLnIdx;
var gCurrStickerIdx;
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
    if (gCurrLnIdx === undefined) return;
    gCurrLnIdx++;
    if (gCurrLnIdx > getLinesCount() - 1) gCurrLnIdx = 0;
    renderCanvas();
}

function onMoveCurrElm(moveDiff) {
    if (isNoneSelected()) return;
    if (gCurrStickerIdx === undefined) moveElmY(gCurrLnIdx, moveDiff, true);
    else moveElmY(gCurrStickerIdx, moveDiff, false);
    renderCanvas();
}

function onAddLine() {
    gCurrStickerIdx = undefined;
    createNewLine(gElCanvas.width, gElCanvas.height, gCurrColor, gCurrFont);
    gCurrLnIdx = getLinesCount() - 1;
    emptyMemeTxtInput();
    renderCanvas();
}

function onDeleteLine() {
    if (isNoneSelected()) return;
    if (gCurrStickerIdx === undefined) {
        deleteElm(gCurrLnIdx, true);
        gCurrLnIdx = 0;
        emptyMemeTxtInput();
        if (getLinesCount() === 0) {
            gCurrLnIdx = undefined;
            updateCurrElement(getStickersCount() - 1, false);
        }
    } else {
        deleteElm(gCurrStickerIdx, false);
        gCurrStickerIdx = 0;
        if (getStickersCount() === 0) {
            gCurrStickerIdx = undefined;
            updateCurrElement(getLinesCount() - 1, true);
        }
    }
    renderCanvas();
}

function updateCurrElement(idx, isLine) {
    if (idx < 0) {
        gCurrStickerIdx = undefined;
        gCurrLnIdx = undefined;
        return;
    }
    if (isLine) {
        gCurrLnIdx = idx;
        gCurrStickerIdx = undefined;
        renderCanvas();
        return;
    }
    gCurrLnIdx = undefined;
    gCurrStickerIdx = idx;
    renderCanvas();
}

function onEditMemeText(elTextInput) {
    if (gCurrLnIdx === undefined) {
        createNewLine(gElCanvas.width, gElCanvas.height, gCurrColor, gCurrFont);
        gCurrLnIdx = 0;
    }
    const txt = elTextInput.value;
    updateMemeTxt(gCurrLnIdx, txt);
    renderCanvas();
}

function updateMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = getLnObjectByIdx(gCurrLnIdx).txt;
}

function emptyMemeTxtInput() {
    document.querySelector('[name=meme-txt]').value = '';
}

function onChangeSize(sizeDiff) {
    if (isNoneSelected()) return;
    if (gCurrStickerIdx === undefined) {
        changeElmSize(gCurrLnIdx, sizeDiff, true);
        renderCanvas();
        return;
    }
    changeElmSize(gCurrStickerIdx, sizeDiff, false);
    renderCanvas();
}

function onChangeAlign(align) {
    if (gCurrLnIdx === undefined) return;
    changeAlign(gCurrLnIdx, align, gElCanvas.width);
    renderCanvas();
}

function onChangeFont(elSelectFont) {
    if (gCurrLnIdx === undefined) return;
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

function renderStickers() {
    let stickers = getStickers();
    const strHtml = stickers.map((sticker) => `<img src="${sticker.url}" onclick="onAddSticker('${sticker.id}')">`).join('');
    document.querySelector('.stickers').innerHTML = strHtml;
}

function onAddSticker(stickerId) {
    createNewSticker(stickerId, gElCanvas.width, gElCanvas.height);
    gCurrStickerIdx = getStickersCount() - 1;
    gCurrLnIdx = undefined;
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
    const lnsObjs = getAllLines();

    lnsObjs.forEach((lnObj, lnIdx) => {
        const { txt, pos } = lnObj;
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
            gCtx.fillText(txt, pos.x, pos.y);
            gCtx.strokeText(txt, pos.x, pos.y);
            updateTxtWidth(lnIdx, gCtx.measureText(txt).width);
        });
    });
}

function addMemesStickers() {
    const currStickers = getMemeStickers();
    currStickers.forEach((sticker, idx) => {
        const { src, width, height, pos } = sticker;
        const img = new Image();
        img.src = src;
        const stickerH = (img.height / img.width) * width;
        setStickerH(idx, stickerH);
        gCtx.drawImage(img, pos.x, pos.y, width, stickerH);
    });
}

function showFocusBorder() {
    if (isNoneSelected()) return;
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = 'white';
    if (gCurrStickerIdx === undefined) {
        showLineFocusBorder();
        return;
    }
    showStickerFocusBorder();
}

function showLineFocusBorder() {
    const lnObj = getLnObjectByIdx(gCurrLnIdx);
    const { pos, size, width } = lnObj;
    gCtx.beginPath();

    let widthOffst = -width;
    if (lnObj.align === 'left') widthOffst = 0;
    else if (lnObj.align === 'center') widthOffst = -width / 2;
    const xStart = pos.x + widthOffst - 5;
    const yStart = pos.y - size
    const rectW = width + 10;
    const rectH = size + 15
    gCtx.rect(xStart, yStart, rectW, rectH);
    gCtx.stroke();
}

function showStickerFocusBorder() {
    const stickerObj = getCurrStickerObjByIdx(gCurrStickerIdx);
    const { pos, width, height } = stickerObj;
    gCtx.beginPath();
    gCtx.rect(pos.x, pos.y, width, height);
    gCtx.stroke();
}

function resizeCanvas() {
    const elContainerHeilo = document.querySelector('.canvas-container-heilo');
    const elContainer = document.querySelector('.canvas-container');
    const canvasContainerH = elContainer.offsetWidth * gCurrRatio;
    elContainerHeilo.style.height = canvasContainerH + 'px';
    gElCanvas.width = elContainer.offsetWidth;
    gElCanvas.height = canvasContainerH;
}

function isNoneSelected() {
    return gCurrLnIdx === undefined && gCurrStickerIdx === undefined;
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

function onToggleAboutModal(){
    if (document.body.classList.contains('open-menu')) onToggleMenu();
    document.body.classList.toggle('open-about');
}

function onOpenGallery() {
    if (document.body.classList.contains('open-menu')) onToggleMenu();
    else if (document.body.classList.contains('open-memes')) onToggleMemesMenu();
    let elGallery = document.querySelector('.gallery-container');
    if (!elGallery.classList.contains('hide')) return;

    emptyMemeTxtInput();
    gCurrLnIdx = undefined;
    document.body.classList.add('show-gallery');
    elGallery.classList.remove('hide');
    document.querySelector('.meme-editor').classList.add('hide');
    gCurrSearchWord = null;
}

function renderGallery() {
    let allImgs = getImages();
    if (gCurrSearchWord && gCurrSearchWord !== 'all') allImgs = getRelevantImgs(allImgs);
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
    let basicSize;
    if (screenWidth > 1080) {
        amount = 15;
        basicSize = 12;
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

function onChooseImg(idx = -1, imgSrc) {
    console.log('imgSrc:', imgSrc);
    initTxtCtrls();
    setMemeImage(idx, imgSrc);
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
    const clickedLineIdx = getClickedLineIdx(pos);
    const clickedStickerIdx = geClickedStickerIdx(pos);
    if (clickedLineIdx < 0 && clickedStickerIdx < 0) return;

    if (clickedStickerIdx < 0) {
        updateCurrElement(clickedLineIdx, true);
        updateMemeTxtInput();
    } else updateCurrElement(clickedStickerIdx, false);

    gIsDragging = true;
    gStartPos = pos;
    document.body.style.cursor = 'grabbing';
}

function onMove(ev) {
    if (gIsDragging) {
        let currObj;
        const pos = getEvPos(ev);
        if (gCurrStickerIdx === undefined) {
            moveLine(pos);
            return;
        }
        moveSticker(pos);
        return;
    }
    
}

function moveSticker(pos) {
    const currSticker = getCurrStickerObjByIdx(gCurrStickerIdx);
    const dx = pos.x - gStartPos.x;
    const dy = pos.y - gStartPos.y;
    currSticker.pos.x += dx;
    currSticker.pos.y += dy;
    gStartPos = pos;
    renderCanvas();
}

function moveLine(pos) {
    const currLn = getLnObjectByIdx(gCurrLnIdx);
    const dy = pos.y - gStartPos.y;
    currLn.pos.y += dy;
    gStartPos = pos;
    renderCanvas();
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

function onDownloadImg() {
    resetIdxs();
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
    resetIdxs();
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
    resetIdxs();
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

function onDeleteMeme(memeId){
    toggleModalScreen();
    const strHtml = `<h2 class="btn start-action">Are you sure?</h2> <div class="modal-btns-container flex space-between"><button onClick="onRemoveMeme('${memeId}')">Yes</button> <button onClick="onCloseDownloadShareModal()">No!</button></div>`;
    toggleModalScreen(strHtml)
}

function onRemoveMeme(id){
    removeSavedMeme(id);
    renderSavedMemes();
    onCloseDownloadShareModal()
}

function onCloseDownloadShareModal() {
    toggleModalScreen();
    gCurrLnIdx = getLinesCount() ? 0 : undefined;
}

function toggleModalScreen(strHtml) {
    if (strHtml) document.querySelector('.download-share.modal').innerHTML = strHtml;
    document.body.classList.toggle('open-modal');
}

function resetIdxs() {
    gCurrLnIdx = undefined;
    gCurrStickerIdx = undefined;
}

function onImgInput(ev) {
    loadImageFromInput(ev);
}

function loadImageFromInput(ev) {
    document.querySelector('.share-container').innerHTML = '';
    var reader = new FileReader();

    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        onChooseImg(-1, event.target.result);
    };
    reader.readAsDataURL(ev.target.files[0]);
}
