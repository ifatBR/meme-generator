'use strict';

var gKeywords = { crazy: 2, angry: 1, funny: 5, cute: 2 };
var gImgs = [];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        {
            txt: '',
            txtWidth:0,
            size: 20,
            align: 'center',
            color: 'blue',
            x:200,
            y:40
        },
        {
            txt: '',
            txtWidth:0,
            size: 20,
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
    gMeme.lines[lnIdx].txtWidth = txtWidth;
}

function getImgIdxById(){
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}

function logMeme(){
    console.log('gMeme:', gMeme)
}

function getClickedLine(clickedPos) {
    console.log('clicke pos y',clickedPos.y)
    const idx = gMeme.lines.findIndex((ln) => {
        return (ln.x-(ln.txtWidth/2)) < clickedPos.x &&
        (ln.x+(ln.txtWidth/2)) > clickedPos.x &&
        (ln.y-(ln.size/2)) < clickedPos.y &&
        (ln.y+(ln.size/2)) > clickedPos.y
    });
    console.log('idx:',idx);

    if(!idx) return;
    return gMeme.lines[idx];
    // const { pos } = gCircle
    // const distance = Math.sqrt((pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2)
    // return distance <= gCircle.size
}
