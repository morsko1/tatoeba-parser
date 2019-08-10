const fs = require('fs');

async function init() {
    const start = new Date();
    await proccessLinks();
    await proccessSentences();
    await console.log('done in ', (new Date() - start)/1000, ' seconds');
    await console.log('files have written in ./data-output');
}

let linksTemp = {};

function proccessLinks() {
    return new Promise((resolve, reject) => {
        console.log('proccess links...');

        let links = fs.readFileSync('./data-input/links.csv', 'utf8');
        let linksArray = links.split(/\r?\n/);
        links = null;
        for (let i = 0, len = linksArray.length; i < len; i++) {
            const line = linksArray[i];
            const splitIndex = line.indexOf('\t');
            const prop = line.slice(0, splitIndex).trim();
            const value = line.slice(splitIndex + 1).trim();

            linksTemp[value] = prop;
        }
        linksArray = null;
        console.log('links have proccessed');
        resolve(true);
        return;
    });
}

function proccessSentences () {
    return new Promise(async (resolve, reject) => {
        console.log('proccess sentences...');
        let sentences = fs.readFileSync('./data-input/sentences.csv', 'utf8');
        let sentencesArray = sentences.split(/\r?\n/);
        sentences = null;

        let sentencesWithAudio = fs.readFileSync('./data-input/sentences_with_audio.csv', 'utf8');
        let sentencesWithAudioArray = sentencesWithAudio.split(/\r?\n/);
        sentencesWithAudio = null;
        let audioIdsList = {};
        for (let i = 0, len = sentencesWithAudioArray.length; i < len; i++) {
            const item = sentencesWithAudioArray[i];
            const firstEmpty = item.indexOf('\t');
            const substring = item.slice(0, firstEmpty).trim();
            audioIdsList[substring] = null;
        }
        sentencesWithAudioArray = null;

        // create data-output directory if doesn't exist
        const dir = './data-output';
        if (!fs.existsSync(dir)){
            console.log('data-output directory has created');
            fs.mkdirSync(dir);
        }

        // proceess rus sentences
        let rus = sentencesArray.filter(item => {
            return item.indexOf('\trus\t') !== -1;
        });
        let rusSentencesArray = [];
        for (let i = 0, len = rus.length; i < len; i++) {
            const item = rus[i];
            const spaceCount = (item.trim().split(' ').length - 1);
            if (spaceCount < 3) {
                continue;
            }
            const firstEmpty = item.indexOf('\t');
            const id = item.slice(0, firstEmpty).trim();
            const startOfSentenceIndex = item.indexOf('rus', firstEmpty);
            const text = item.slice(startOfSentenceIndex + 3).trim();
            const sentId = linksTemp[id];
            if (sentId) {
                rusSentencesArray.push({
                    id: id,
                    text: text,
                    sentenceId: sentId,
                    hasAudio: id in audioIdsList
                });
            }
        }
        rus = null;

        console.log('num of rus sentences = ', rusSentencesArray.length);

        fs.writeFileSync('./data-output/data-rus.min.json', JSON.stringify(rusSentencesArray), 'utf-8');
        fs.writeFileSync('./data-output/data-rus.json', JSON.stringify(rusSentencesArray, null, 2), 'utf-8');

        // proccess eng sentences
        let eng = sentencesArray.filter(item => {
            return item.indexOf('\teng\t') !== -1;
        });
        sentencesArray = null;
        let engSentencesArray = [];
        for (let i = 0, len = eng.length; i < len; i++) {
            const item = eng[i];
            const spaceCount = (item.trim().split(' ').length - 1);
            if (spaceCount < 3) {
                continue;
            }
            const firstEmpty = item.indexOf('\t');
            const id = item.slice(0, firstEmpty).trim();
            const startOfSentenceIndex = item.indexOf('eng', firstEmpty);
            const text = item.slice(startOfSentenceIndex + 3).trim();

            const sentId = linksTemp[id];

            if (sentId) {
                engSentencesArray.push({
                    id: id,
                    text: text,
                    sentenceId: sentId,
                    hasAudio: id in audioIdsList
                });
            }
        }
        eng = null;

        audioIdsList = null;
        linksTemp = {};
        console.log('num of eng sentences = ', engSentencesArray.length);

        fs.writeFileSync('./data-output/data-eng.min.json', JSON.stringify(engSentencesArray), 'utf-8');
        fs.writeFileSync('./data-output/data-eng.json', JSON.stringify(engSentencesArray, null, 2), 'utf-8');

        let engWithAudio = engSentencesArray.filter(item => item.hasAudio);
        let rusWithAudio = rusSentencesArray.filter(item => item.hasAudio);
        console.log('num of eng sentences with audio = ', engWithAudio.length);
        console.log('num of rus sentences with audio = ', rusWithAudio.length);

        fs.writeFileSync('./data-output/data-eng-with-audio.json', JSON.stringify(engWithAudio, null, 2), 'utf-8');
        fs.writeFileSync('./data-output/data-eng-with-audio.min.json', JSON.stringify(engWithAudio), 'utf-8');
        engWithAudio = null;
        fs.writeFileSync('./data-output/data-rus-with-audio.json', JSON.stringify(rusWithAudio, null, 2), 'utf-8');
        fs.writeFileSync('./data-output/data-rus-with-audio.min.json', JSON.stringify(rusWithAudio), 'utf-8');
        rusWithAudio = null;

        // generate array of eng-rus sentences
        let engRusArray = [];
        for (let i = 0, len = rusSentencesArray.length; i < len; i++) {
            let item = rusSentencesArray[i];
            linksTemp[item.sentenceId] = {rus: i};
        }
        for (let i = 0, len = engSentencesArray.length; i < len; i++) {
            let item = engSentencesArray[i];
            item.sentenceId in linksTemp ? linksTemp[item.sentenceId].eng = i : linksTemp[item.sentenceId] = {eng: i};
        }
        let index = 0;
        for (let prop in linksTemp) {
            if ('rus' in linksTemp[prop] && 'eng' in linksTemp[prop]) {
                const rusItem = rusSentencesArray[linksTemp[prop].rus];
                const engItem = engSentencesArray[linksTemp[prop].eng];
                const obj = {
                    id: index++,
                    // sentenceId: rusItem.sentenceId,
                    textEng: engItem.text,
                    textRus: rusItem.text,
                };

                // set translate id only if audio exists
                if (engItem.hasAudio) {
                    obj.engAudio = engItem.id;
                }
                if (rusItem.hasAudio) {
                    obj.rusAudio = rusItem.id;
                }

                engRusArray.push(obj);
            }
        }

        linksTemp = null;
        engSentencesArray = null;
        rusSentencesArray = null;

        console.log('num of rus-eng sentences = ', engRusArray.length);

        fs.writeFileSync('./data-output/data.json', JSON.stringify(engRusArray, null, 2), 'utf-8');
        fs.writeFileSync('./data-output/data.min.json', JSON.stringify(engRusArray), 'utf-8');
        resolve(true);
        return;
    });
}

init();
