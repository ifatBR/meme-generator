'use strict';

var gKeywords = {
    all: 24,
    angry: 1,
    funny: 32,
    cute: 2,
    man: 2,
    baby: 10,
    politics: 7,
};

var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [],
};

var gImgs = [
    { id: 101, url: 'img/1.jpg', keywords: ['politics', 'angry', 'man', 'crazy'] },
    { id: 102, url: 'img/2.jpg', keywords: ['animals', 'cute', 'dog'] },
    { id: 103, url: 'img/3.jpg', keywords: ['animals', 'baby', 'cute', 'sleep', 'dog'] },
    { id: 104, url: 'img/4.jpg', keywords: ['animals', 'cute', 'sleep', 'cat'] },
    { id: 105, url: 'img/5.jpg', keywords: ['baby', 'win', 'success'] },
    { id: 106, url: 'img/6.jpg', keywords: ['crazy', 'funny', 'man', 'smiling', 'explaining'] },
    { id: 107, url: 'img/7.jpg', keywords: ['baby', 'funny', 'cute', 'surprise'] },
    { id: 108, url: 'img/8.jpg', keywords: ['man', 'smiling', 'smug'] },
    { id: 109, url: 'img/9.jpg', keywords: ['baby', 'evil', 'laughing'] },
    { id: 110, url: 'img/10.jpg', keywords: ['politics', 'laughing', 'man'] },
    { id: 111, url: 'img/11.jpg', keywords: ['man', 'kissing', 'sports'] },
    { id: 112, url: 'img/12.jpg', keywords: ['man', 'explaining', 'pointing'] },
    { id: 113, url: 'img/13.jpg', keywords: ['man', 'cheers', 'smiling', 'movie', 'celebrity'] },
    { id: 114, url: 'img/14.jpg', keywords: ['man', 'seriouse', 'sunglasses', 'movie'] },
    { id: 115, url: 'img/15.jpg', keywords: ['man', 'explaining', 'movie'] },
    { id: 116, url: 'img/16.jpg', keywords: ['man', 'laughing', 'surprised', 'movie'] },
    { id: 117, url: 'img/17.jpg', keywords: ['man', 'explaining', 'pointing', 'politics'] },
    { id: 118, url: 'img/18.jpg', keywords: ['pointing', 'movie', 'explaining', 'scared', 'sad'] },
    { id: 119, url: 'img/19.jpg', keywords: ['surprised', 'angry', 'shouting', 'man'] },
    { id: 120, url: 'img/20.jpg', keywords: ['happy', 'dancing', 'woman', 'movie'] },
    { id: 121, url: 'img/21.jpg', keywords: ['evil', 'quotes', 'movie'] },
    { id: 122, url: 'img/22.jpg', keywords: ['dancing', 'baby', 'happy', 'funny'] },
    { id: 123, url: 'img/23.jpg', keywords: ['angry', 'ugly', 'stupid', 'man', 'pilitician'] },
    { id: 124, url: 'img/24.jpg', keywords: ['animals', 'dog', 'funny', 'cute'] },
    { id: 125, url: 'img/25.jpg', keywords: ['happy', 'woman', 'shouting', 'celebrity'] },
];

var gStickers=[];

const STICKERS_PAGE_SIZE = 3;
var gStickersPageIdx = 0;

var gSavedMemes=[];
const SAVED_MEMES_KEY = 'mySavedMemes';

function getSavedMemes() {
    gSavedMemes = loadFromStorage(SAVED_MEMES_KEY);
    if(!gSavedMemes) gSavedMemes = [];
    return gSavedMemes;
}

function addToSavedMemes(imgContent) {
    const id = makeId();
    gSavedMemes.push({id,imgContent});
    return saveToStorage(SAVED_MEMES_KEY, gSavedMemes);
}

function getImages() {
    return gImgs;
}

function updateKeywords() {
    gImgs.forEach((img) => {
        img.keywords.forEach((word) => {
            if (!gKeywords[word]) {
                gKeywords[word] = 1;
                return;
            }
            gKeywords[word]++;
        });
    });
}

function getKeywords() {
    return gKeywords;
}

function increaseWordRate(clickedWord) {
    gKeywords[clickedWord]++;
}

function initStickers(){
    for(var i=1; i<9;i++){
        gStickers.push({id:makeId(), url:`${i}.png`})
    }
}

function getStickers(){
    let startIdx = gStickersPageIdx * STICKERS_PAGE_SIZE;
    return gStickers.slice(startIdx, startIdx+STICKERS_PAGE_SIZE)
    
}

function changePage(pageDiff){
    gStickersPageIdx += pageDiff;
    if (gStickersPageIdx * STICKERS_PAGE_SIZE >= gStickers.length ) gStickersPageIdx = 0;
    else if(gStickersPageIdx < 0) gStickersPageIdx = Math.floor(gStickers.length/STICKERS_PAGE_SIZE) ;
}

function setMemeImage(id) {
    gMeme.selectedImgId = id;
}

function getImgSrc() {
    const idx = getImgIdxById();
    return gImgs[idx].url;
}

function getLnObjectByIdx(lnIdx) {
    const idx = getImgIdxById();
    return gMeme.lines[lnIdx];
}

function changeFontSize(lnIdx, sizeDiff) {
    if ((sizeDiff < 0 && gMeme.lines[lnIdx].size < 20) || (sizeDiff > 0 && gMeme.lines[lnIdx].size > 80)) return;
    getLnObjectByIdx(lnIdx).size += sizeDiff;
}

function changeAlign(lnIdx, align, canvasWidth) {
    const lnObj = getLnObjectByIdx(lnIdx);
    lnObj.align = align;
    if (align === 'left') lnObj.x = 0 + 10;
    else if (align === 'right') lnObj.x = canvasWidth - 10;
    else lnObj.x = canvasWidth / 2;
}

function changeColor(lnIdx, color) {
    getLnObjectByIdx(lnIdx).color = color;
}

function updateMemeTxt(lnIdx, txt) {
    getLnObjectByIdx(lnIdx).txt = txt;
}

function updateTxtWidth(lnIdx, txtWidth) {
    getLnObjectByIdx(lnIdx).width = txtWidth;
}

function getImgIdxById() {
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}

function getLinesCount() {
    return gMeme.lines.length;
}

function resetLines() {
    gMeme.lines = [];
}

function createNewLine(x, currColor, currFont) {
    const lnsCount = getLinesCount();
    if (gMeme.lines[lnsCount - 1]?.txt === '') return;
    let y = 40;
    if (lnsCount === 1) y = gElCanvas.height - 40;
    else if (lnsCount > 0) y = gElCanvas.height / 2;
    gMeme.lines.push({
        txt: '',
        width: 0,
        size: 40,
        align: 'center',
        isStroke: true,
        color: currColor,
        font: currFont,
        x: x,
        y: y,
    });
}

function deleteLine(lnIdx) {
    gMeme.lines.splice(lnIdx, 1);
}

function getAllLines() {
    return gMeme.lines;
}

function moveLineY(lnIdx, moveDiff) {
    getLnObjectByIdx(lnIdx).y += moveDiff;
}

function getClickedLine(clickedPos) {
    const idx = gMeme.lines.findIndex((ln) => {
        let offset = 0;
        if (ln.align === 'left') offset = ln.width / 2;
        else if (ln.align === 'right') offset = -ln.width / 2;

        return (
            ln.x - ln.width / 2 + offset < clickedPos.x &&
            ln.x + ln.width / 2 + offset > clickedPos.x &&
            ln.y - ln.size - 5 < clickedPos.y &&
            ln.y + 10 > clickedPos.y
        );
    });

    if (idx < 0) return;
    return idx;
}
