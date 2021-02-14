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
    currSearchWord: '',
    selectedImgId: 5,
    selectedLineIdx: -1,
    selectedStickerIdx: -1,
    lines: [],
    stickers: [],
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

var gStickers = [];

const STICKERS_PAGE_SIZE = 3;
var gStickersPageIdx = 0;

var gSavedMemes = [];
const SAVED_MEMES_KEY = 'mySavedMemes';

function getSavedMemes() {
    gSavedMemes = loadFromStorage(SAVED_MEMES_KEY);
    if (!gSavedMemes) gSavedMemes = [];
    return gSavedMemes;
}

function addToSavedMemes(imgContent) {
    const id = makeId();
    gSavedMemes.push({ id, imgContent });
    return saveToStorage(SAVED_MEMES_KEY, gSavedMemes);
}

function removeSavedMeme(id) {
    const idx = gSavedMemes.findIndex((savedMeme) => savedMeme.id === id);
    gSavedMemes.splice(idx, 1);
    saveToStorage(SAVED_MEMES_KEY, gSavedMemes);
}

function getImgs() {
    const searchWord = gMeme.currSearchWord
    if(!searchWord) return gImgs;
    return gImgs.filter((img) => img.keywords.includes(searchWord));
    // return gImgs
}

function updateSearchWord(searchWord){
    if(searchWord==='all') searchWord = '';
    gMeme.currSearchWord = searchWord;
    increaseWordRate(searchWord)
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

function increaseWordRate(searchWord) {
    gKeywords[searchWord]++;
}

function initStickers() {
    for (var i = 1; i <= 15; i++) {
        gStickers.push({ id: makeId(), url: `img/stickers/${i}.png` });
    }
}

function getStickers() {
    let startIdx = gStickersPageIdx * STICKERS_PAGE_SIZE;
    return gStickers.slice(startIdx, startIdx + STICKERS_PAGE_SIZE);
}

function getStickersCount() {
    return gMeme.stickers.length;
}

function addNewSticker(id, canvasW, canvasH) {
    const newSticker = createNewSticker(id, canvasW, canvasH);
    gMeme.stickers.push(newSticker);
    gMeme.selectedStickerIdx = gMeme.stickers.length - 1;
    gMeme.selectedLineIdx = -1;
}

function createNewSticker(id, canvasW, canvasH) {
    const sticker = getStickerById(id);
    const newSticker = {
        src: sticker.url,
        pos: {
            x: canvasW / 2,
            y: canvasH / 2,
        },
        width: 80,
        height: 0,
    };
    return newSticker;
}


function setStickerH(idx, stickerH) {
    gMeme.stickers[idx].height = stickerH;
}

function getStickerById(stickerId) {
    return gStickers.find((sticker) => sticker.id === stickerId);
}

function getMemeStickers() {
    return gMeme.stickers;
}

function changeStickersPage(pageDiff) {
    gStickersPageIdx += pageDiff;
    if (gStickersPageIdx * STICKERS_PAGE_SIZE >= gStickers.length) gStickersPageIdx = 0;
    else if (gStickersPageIdx < 0) gStickersPageIdx = Math.ceil(gStickers.length / STICKERS_PAGE_SIZE) - 1;
}

function setMemeImg(id, imgSrc) {
    if (id < 0) {
        id = makeId();
        gImgs.push({ id, url: imgSrc, keywords: ['personal'] });
    }
    gMeme.selectedImgId = id;
}

function getImgSrc() {
    const idx = getImgIdxById();
    return gImgs[idx].url;
}


function changeSelectedSize(sizeDiff) {
    let idx = gMeme.selectedLineIdx;
    if (idx >= 0) {
        const line = gMeme.lines[idx];
        if ((sizeDiff < 0 && line.size < 20) || (sizeDiff > 0 && line.size > 80)) return;
        gMeme.lines[idx].size += sizeDiff * 2;
        return;
    }

    idx = gMeme.selectedStickerIdx;
    if (idx < 0) return;
    const sticker = gMeme.stickers[idx];
    if ((sizeDiff < 0 && sticker.width < 30) || (sizeDiff > 0 && sticker.width > 300)) return;
    sticker.width += sizeDiff * 3;
}

function changeAlign(align, canvasW) {
    const idx = gMeme.selectedLineIdx;
    if(idx<0) return;
    const line =  gMeme.lines[idx];
    line.align = align;
    if (align === 'left') line.pos.x = 0 + 10;
    else if (align === 'right') line.pos.x = canvasW - 10;
    else line.pos.x = canvasW / 2;
}

function changeColor(color) {
    const idx = gMeme.selectedLineIdx;
    if(idx<0) return;
    gMeme.lines[idx].color = color;
}

function updateSelectedLineFont(font){
    const idx = gMeme.selectedLineIdx;
    if(idx<0) return;
    gMeme.lines[idx].font = font;
}

function toggleStroke(){
    const idx = gMeme.selectedLineIdx;
    if(idx<0) return;
    gMeme.lines[idx].isStroke = !gMeme.lines[idx].isStroke;

}

function updateMemeTxt(txt, canvasW, canvasH, color, font) {
    if (gMeme.selectedLineIdx < 0) {
        addNewLine(canvasW, canvasH, color, font);
        gMeme.selectedLineIdx = gMeme.lines.length - 1;
    }
    gMeme.lines[gMeme.selectedLineIdx].txt = txt;
}

function getSelectedLineTxt() {
    if(gMeme.selectedLineIdx > 0) return gMeme.lines[gMeme.selectedLineIdx].txt;
    return '';
}

function updateTxtWidth(idx, txtWidth) {
    gMeme.lines[idx].width = txtWidth;
}

function getBorderDims() {
    let idx = gMeme.selectedLineIdx;
    // let xStart;
    // let yStart;
    // let w;
    // let h;
    if (idx >= 0) {
        const { pos, size, width, align } = gMeme.lines[idx];
        let widthOffst = -width;
        if (align === 'left') widthOffst = 0;
        else if (align === 'center') widthOffst = -width / 2;
        const xStart = pos.x + widthOffst - 5;
        const yStart = pos.y - size;
        const w = width + 10;
        const h = size + 15;
        return { xStart, yStart, w, h };
    }
    idx = gMeme.selectedStickerIdx;
    if (idx < 0) return;
    const { pos, width, height} = gMeme.stickers[idx];
    const xStart = pos.x;
    const yStart = pos.y;
    const w = width;
    const h = height;
    return { xStart, yStart, w, h };
}


function getImgIdxById() {
    return gImgs.findIndex((img) => gMeme.selectedImgId === img.id);
}

function getSelectedLineIdx() {
    //?
    return gMeme.selectedLineIdx;
}

function switchLines() {
    if (!gMeme.lines.length) return;
    if (gMeme.selectedLineIdx === gMeme.lines.length - 1) {
        gMeme.selectedLineIdx = 0;
        return;
    } //Add switch to sticker
    gMeme.selectedLineIdx++;
}

function getLinesCount() {
    return gMeme.lines.length;
}

function resetLines() {
    gMeme.lines = [];
    gMeme.stickers = [];
}

function addNewLine(canvasW, canvasH, color, font) {
    gMeme.selectedStickerIdx = -1;
    let linesCount = getLinesCount();
    if (linesCount && !gMeme.lines[linesCount - 1].txt){
        gMeme.selectedLineIdx =   linesCount - 1; 
        return;
    }
    const newLine = createNewLine(canvasW, canvasH, color, font);
    gMeme.lines.push(newLine);
    gMeme.selectedLineIdx = linesCount++;
}

function createNewLine(canvasW, canvasH, color, font) {
    let y = 40;
    const linesCount = gMeme.lines.length;
    if (linesCount === 1) y = canvasH - 40;
    else if (linesCount > 0) y = canvasH / 2;
    const newLine = {
        txt: '',
        width: 0,
        size: 40,
        align: 'center',
        isStroke: true,
        color,
        font,
        pos: {
            x: canvasW / 2,
            y,
        },
    };
    return newLine;
}

function deleteCurr() {
    let idx = gMeme.selectedLineIdx;
    if (idx >= 0) {
        gMeme.lines.splice(idx, 1);
        if (gMeme.lines.length) {
            gMeme.selectedLineIdx = gMeme.lines.length - 1;
            return;
        }
        gMeme.selectedLineIdx = -1;
        gMeme.selectedStickerIdx = gMeme.stickers.length - 1;
    }

    idx = gMeme.selectedStickerIdx;
    if (idx >= 0) {
        gMeme.stickers.splice(idx, 1);
        if (gMeme.stickers.length) {
            gMeme.selectedStickerIdx = gMeme.stickers.length - 1;
            return;
        }
    }
    gMeme.selectedStickerIdx = -1;
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function getAllLines() {
    return gMeme.lines;
}

function moveSelectedYAxis(moveDiff) {
    let idx = gMeme.selectedLineIdx;
    moveDiff *= 3;
    if (idx >= 0) {
        gMeme.lines[idx].pos.y += moveDiff;
        return;
    }
    idx = gMeme.selectedStickerIdx;
    if (idx >= 0) gMeme.stickers[idx].pos.y += moveDiff;
}

function moveSelectedByDragging(pos, gStartPos) {
    const dx = pos.x - gStartPos.x;
    const dy = pos.y - gStartPos.y;
    let idx = gMeme.selectedLineIdx;
    if (idx >= 0) {
        gMeme.lines[idx].pos.x+=dx;
        gMeme.lines[idx].pos.y+=dy;

        return;
    }
    idx = gMeme.selectedStickerIdx;
    if (idx < 0) return;
    gMeme.stickers[idx].pos.x += dx;
    gMeme.stickers[idx].pos.y += dy;
}

function getClickedLineIdx(clickedPos) {
    const idx = gMeme.lines.findIndex((line) => {
        let offset = 0;
        const { pos, align, width, size } = line;
        if (align === 'left') offset = width / 2;
        else if (align === 'right') offset = -width / 2;

        return (
            pos.x - width / 2 + offset < clickedPos.x &&
            pos.x + width / 2 + offset > clickedPos.x &&
            pos.y - size - 5 < clickedPos.y &&
            pos.y + 15 > clickedPos.y
        );
    });
    return idx;
}

function geClickedStickerIdx(clickedPos) {
    const idx = gMeme.stickers.findIndex((sticker) => {
        const { pos, width, height } = sticker;
        return pos.x < clickedPos.x && pos.x + width > clickedPos.x && pos.y < clickedPos.y && pos.y + height > clickedPos.y;
    });
    return idx;
}

function isAnythingClicked(pos) {
    const clickedLineIdx = getClickedLineIdx(pos);
    gMeme.selectedLineIdx = clickedLineIdx;
    const clickedStickerIdx = geClickedStickerIdx(pos);
    gMeme.selectedStickerIdx  = clickedStickerIdx;
    if(clickedLineIdx || clickedStickerIdx) return true;
    return false;
}

function resetSelections() {
    gMeme.selectedLineIdx = -1;
    gMeme.selectedStickerIdx = -1;
}
