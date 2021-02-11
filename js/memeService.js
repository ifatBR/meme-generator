'use strict';

var gKeywords = [ {word:'All', rate: 20}, {word:'angry', rate: 1}, {word:'funny' , rate:32}, {word:'cute', rate:2}, {word:'politician', rate:7}];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [],
};

var gImgs = [
    { id: 1, 
        url: 'img/1.jpg', keywords:['politician', 'angry','man','crazy'] },
    { id: 2, url: 'img/2.jpg', keywords:['animals','cute','dog'] },
    { id: 3, url: 'img/3.jpg', keywords:['animals','baby','cute','sleep','dog'] },
    { id: 4, url: 'img/4.jpg', keywords:['animals','cute','sleep','cat'] },
    { id: 5, url: 'img/5.jpg', keywords:['baby','win','success'] },
    { id: 6, url: 'img/6.jpg', keywords:['crazy','funny','man','smiling','explaining'] },
    { id: 7, url: 'img/7.jpg', keywords:['baby','funny','cute','surprise'] },
    { id: 8, url: 'img/8.jpg', keywords:['man','smiling','smug'] },
    { id: 9, url: 'img/9.jpg', keywords:['baby','evil','laughing'] },
    { id: 10, url: 'img/10.jpg', keywords:['politician', 'laughing','man'] },
    { id: 11, url: 'img/11.jpg', keywords:['man','kissing','sports'] },
    { id: 12, url: 'img/12.jpg', keywords:['man','explaining','pointing'] },
    { id: 13, url: 'img/13.jpg', keywords:['man','cheers','smiling','movie'] },
    { id: 14, url: 'img/14.jpg', keywords:['man','seriouse','sunglasses','movie'] },
    { id: 15, url: 'img/15.jpg', keywords:['man','explaining','movie'] },
    { id: 16, url: 'img/16.jpg', keywords:['man','laughing','surprised','movie'] },
    { id: 17, url: 'img/17.jpg', keywords:['man','explaining','pointing','politician'] },
    { id: 18, url: 'img/18.jpg', keywords:['pointing','movie','explaining','scared','sad'] },
];

function getImages() {
    return gImgs;
}

function getKeywords(){
    return gKeywords;
}

function increaseWordRate(clickedWord){
    gKeywords.find((word)=> word.word ===clickedWord).rate+=1;
}

function changeMemeImage(id) {
    gMeme.selectedImgId = id;
}

function getImgSrc() {
    const idx = getImgIdxById();
    return gImgs[idx].url;
}

function getLnObjectById(lnIdx) {
    const idx = getImgIdxById();
    return gMeme.lines[lnIdx];
}

function changeFontSize(lnIdx, sizeDiff) {
    if ((sizeDiff < 0 && gMeme.lines[lnIdx].size < 20) || (sizeDiff > 0 && gMeme.lines[lnIdx].size > 80)) return;
    getLnObjectById(lnIdx).size += sizeDiff;
}

function changeAlign(lnIdx, align, canvasWidth) {
    const lnObj = getLnObjectById(lnIdx);
    lnObj.align = align;
    if (align === 'left') lnObj.x = 0 + 10;
    else if (align === 'right') lnObj.x = canvasWidth - 10;
    else lnObj.x = canvasWidth / 2;
}

function changeColor(lnIdx, color) {
    getLnObjectById(lnIdx).color = color;
}

function updateMemeTxt(lnIdx, txt) {
    getLnObjectById(lnIdx).txt = txt;
}

function updateTxtWidth(lnIdx, txtWidth) {
    getLnObjectById(lnIdx).width = txtWidth;
}

function getImgIdxById() {
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}

function getLinesCount() {
    return gMeme.lines.length;
}

function createNewLine(x) {
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
        color: 'red',
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
    getLnObjectById(lnIdx).y += moveDiff;
    // console.log('gMeme.lines[lnIdx]',gMeme.lines[lnIdx]);
}

function getClickedLine(clickedPos) {
    const idx = gMeme.lines.findIndex((ln) => {
        return (
            ln.x - ln.width / 2 < clickedPos.x &&
            ln.x + ln.width / 2 > clickedPos.x &&
            ln.y - ln.size - 5 < clickedPos.y &&
            ln.y + 10 > clickedPos.y
        );
    });
    // console.log('idx',idx);
    if (idx < 0) return;
    return idx;
    // return gMeme.lines[idx];
    // const { pos } = gCircle
    // const distance = Math.sqrt((pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2)
    // return distance <= gCircle.size
}

//privat funcs\\
function _logMeme() {
    console.log('gMeme:', gMeme);
}
