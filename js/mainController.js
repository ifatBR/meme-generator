'use strict';
var gElCanvas;
var gCtx;

function init() {
    initImageGallery();
    gElCanvas = document.getElementById('main-canvas')
    gCtx = gElCanvas.getContext('2d')
    drawImgFromlocal()
    //TODO:  resizeCanvas()
    //TODO: add event listener

}


function initImageGallery(){
    createImageGallery();
    
}

function onChooseImg(id){
    updateMemeImage(id);
    drawImgFromlocal();

}

function onEditMemeText(elTextInput){
    const txt= elTextInput.value;
    updateMemeTxt(0,txt);
    drawImgFromlocal();
}

function drawImgFromlocal() {
    const img = new Image()
    img.src = getImgSrc();
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height) //img,x,y,xend,yend
    const txt = getImgTxt();
    addMemeText(txt,0,40)
        
    }
}

function addMemeText(text, x,y){
    gCtx.lineWidth = 2
    gCtx.strokeStyle = 'red'
    gCtx.fillStyle = 'white'
    gCtx.font = '40px impact'
    gCtx.textAlign = 'left'
    gCtx.fillText(text, x, y)
    gCtx.strokeText(text, x, y)
}


//For when I want to add download
function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL()
    elLink.href = data
    elLink.download = 'my-img.jpg'
}