### tatoeba-parser

Parser works with huge amount of data by [Tatoeba project](https://tatoeba.org/rus/downloads).  
And it generates some JSON files with data.  
Here are file names with data examples:

1) `'data.js'` (rus-eng sentences)
```
{
    "id": 3,
    "textEng": "You can't achieve the impossible without attempting the absurd.",
    "textRus": "Нельзя достичь невозможного, не делая безумных попыток."
}
```
 2) `'data-eng.json'`
 ```
 {
    "id": "1288",
    "text": "I just don't know what to say.",
    "sentenceId": "8003976",
    "hasAudio": true
  }
 ```
 3) `'data-rus.json'`
```
{
    "id": "243",
    "text": "Один раз в жизни я делаю хорошее дело... И оно бесполезно.",
    "sentenceId": "5507120",
    "hasAudio": true
 }
 ```
 4) `'data-eng-with-audio.json'`
 ```
 {
    "id": "1277",
    "text": "I have to go to sleep.",
    "sentenceId": "7960374",
    "hasAudio": true
 }
 ```
 5) `'data-rus-with-audio.json'`
 ```
 {
    "id": "5430",
    "text": "Нелегко решать, что правильно, а что нет, но приходится это делать.",
    "sentenceId": "1596576",
    "hasAudio": true
  }
 ```
 and also minified files.  
 
#### How to:
1) download the data from the following links:  
[sentences](http://downloads.tatoeba.org/exports/sentences.tar.bz2)  
[links](http://downloads.tatoeba.org/exports/links.tar.bz2)  
[sentences with audio](http://downloads.tatoeba.org/exports/sentences_with_audio.tar.bz2)
2) unzip downloaded files to get following files: `links.csv, sentences.csv, sentences_with_audio.csv`.
3) create a new directory `'data-input'` in the project's root folder.
4) put `links.csv, sentences.csv, sentences_with_audio.csv` to `'data-input'` directory:
5) run `'npm start'`
6) result will be placed to `'data-output'` directory.
