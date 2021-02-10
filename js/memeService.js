'use strict';

var gKeywords = { crazy: 2, angry: 1, funny: 5, cute: 2 };
var gImgs = [];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        // {
        //     txt: '',
        //     width:0,
        //     size: 40,
        //     align: 'center',
        //     color: 'blue',
        //     x:200,
        //     y:40
        // },
        // {
        //     txt: '',
        //     width:0,
        //     size: 40,
        //     align: 'center',
        //     color: 'blue',
        //     x:200,
        //     y:360
        // },
    ],
};

function createImageGallery() {
    for (var i = 1; i <= 18; i++) {
        gImgs.push({ id: i, url: `img/${i}.jpg` });
    }
    return gImgs;
}

function updateMemeImage(id) {
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
