const clipboardy = require('clipboardy');
const robot = require('robotjs');
const puppeteer = require('puppeteer');



function readUserInput(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
      readline.close();
    });
  });
}


async function join(password) {
  await clipboardy.write("" + password);
  await robot.keyTap('v', ['control'])
  await robot.mouseToggle("down");
  setTimeout(function()
  {
    robot.mouseToggle("up");
  }, 20);
}


(async () => {
  const TARGET_LIVE_URL = await readUserInput('INPUT URL: ')
  const TARGET_USER = await readUserInput('INPUT TARGET USER: ')

  // const browser = await puppeteer.launch({
  //   args: [
  //       '--no-sandbox',
  //       '--disable-gpu'
  //     ]
  // });
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  console.log("PAGE OPENING...")
  await page.goto(TARGET_LIVE_URL);
  console.log(`READY. NOW WATCHING ${TARGET_LIVE_URL}`)

  await page.on('response', async (response) => {   
    if (response.url().includes('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')) {
      let resJson=await response.json();

      if(resJson.continuationContents.liveChatContinuation.actions){
        [...resJson.continuationContents.liveChatContinuation.actions].forEach(action => {
          console.log(action.addChatItemAction.item.liveChatTextMessageRenderer.authorName.simpleText + ": " + action.addChatItemAction.item.liveChatTextMessageRenderer.message.runs[0].text)
          if(action.addChatItemAction.item.liveChatTextMessageRenderer.authorName.simpleText == TARGET_USER){
            let rawText = action.addChatItemAction.item.liveChatTextMessageRenderer.message.runs[0].text;
            let password = rawText.match(/(パス)(\d{4}$)/);
            if(password){
              join(password[2]);
            }
          };
        })
      }
    };
  });
})();