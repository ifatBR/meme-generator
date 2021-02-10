'use strict';

var gKeywords = { crazy: 2, angry: 1, funny: 5, cute: 2 };
var gImgs = [];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'I can do this!!!',
            width:0,
            size: 40,
            align: 'center',
            color: 'blue',
            x:200,
            y:40
        },
        {
            txt: 'ln 2',
            width:0,
            size: 40,
            align: 'center',
            color: 'blue',
            x:200,
            y:360
        },
    ],
};


function createImageGallery(){
    for(var i=1; i<=18; i++){
        gImgs.push({id:i, url:`img/${i}.jpg`})
    }
    return gImgs;
}

function updateMemeImage(id){
    gMeme.selectedImgId = id;
}

function getImgSrc(){
    const idx = getImgIdxById();
    return gImgs[idx].url;
}

function getLnObjectById(lnIdx){
    const idx = getImgIdxById();
    return gMeme.lines[lnIdx];
}

function changeFontSize(lnIdx, sizeDiff){
    if(sizeDiff <0 && gMeme.lines[lnIdx].size < 20 || sizeDiff > 0 && gMeme.lines[lnIdx].size > 80) return;
    gMeme.lines[lnIdx].size += sizeDiff;
}


function updateMemeTxt(lnIdx,txt){
    gMeme.lines[lnIdx].txt = txt;
}

function updateTxtWidth(lnIdx, txtWidth){
    gMeme.lines[lnIdx].width = txtWidth;
}

function getImgIdxById(){
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}

function getAllLines(){
    return gMeme.lines;
}

function moveLineY(lnIdx, moveDiff){
    gMeme.lines[lnIdx].y += moveDiff;
    // console.log('gMeme.lines[lnIdx]',gMeme.lines[lnIdx]);
}

function getClickedLine(clickedPos) {
    const idx = gMeme.lines.findIndex((ln) => {
        return (ln.x-(ln.width/2)) < clickedPos.x &&
        (ln.x+(ln.width/2)) > clickedPos.x &&
        (ln.y-(ln.size) -5) < clickedPos.y &&
        (ln.y + 10) > clickedPos.y
    });
    // console.log('idx',idx);
    if(idx < 0) return;
    return idx;
    // return gMeme.lines[idx];
    // const { pos } = gCircle
    // const distance = Math.sqrt((pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2)
    // return distance <= gCircle.size
}

//privat funcs\\
function _logMeme(){
    console.log('gMeme:', gMeme)
}
