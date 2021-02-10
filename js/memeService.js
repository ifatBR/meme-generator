'use strict';

var gKeywords = { crazy: 2, angry: 1, funny: 5, cute: 2 };
var gImgs = [];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'I can do this!',
            size: '20',
            align: 'left',
            color: 'blue',
        },
    ],
};

function createImageGallery(){
    for(var i=1; i<=18; i++){
        gImgs.push({id:i, url:`img/${i}.jpg`})
    }
    console.log('gImgs:', gImgs)
    return gImgs;
}

function updateMemeImage(id){
    gMeme.selectedImgId = id;
}

function getImgSrc(){
    const idx = getImgIdxById();
    return gImgs[idx].url;
}

function getImgTxt(){
    const idx = getImgIdxById();
    return gMeme.lines[0].txt;
    //Todo: add line idx
}

function updateMemeTxt(lnIdx,txt){
    gMeme.lines[lnIdx].txt = txt;
}


function getImgIdxById(){
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}
