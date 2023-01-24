//Import TelegramBot
const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR-TOKEN-FROM-BOTFATHER';
const bot = new TelegramBot(token, {polling:true});

//Delay
const delay = ms => new Promise(res => setTimeout(res, ms));

//Imports
const fs = require('fs')
const { exec } = require("child_process");

//Function to execute commands and parse data

function execution(path, domain, chatId) {

    exec(`amass enum -passive -d ${domain} -o output/subdomains.txt `, (error, stdout, stderr) => {
        if (error){
            console.log(error);
            return;
        }
        while (!fs.existsSync(path + '/output/subdomains.txt')) {}
        bot.sendMessage(chatId, "[+] Sending subdomains");
        const filepath =  path + '/output/subdomains.txt';
        fs.readFile(filepath, async(err, data) => {
            if (err) {
                bot.sendMessage(chatId, 'Error al leer el archivo');
                return;
        }
        console.log(stderr);
        console.log(stdout);
        if (data.length >= 4096){
            const max_size = 4096
            var amount_sliced = data.length / max_size
            var start = 0
            var end = max_size
            var message
            for (let i = 0; i < amount_sliced; i++) {
              message = data.slice(start, end)
              bot.sendMessage(chatId, message.toString());
              await delay(30000)
              start = start + max_size
              end = end + max_size
            }
        }else{
            bot.sendMessage(chatId, data.toString());
        }
        bot.sendMessage(chatId, "[+] Sending file with subdomains");
        bot.sendDocument(chatId, path + '/output/subdomains.txt');
        return;
        });
    });

};

//Function to getsubdomains

function getSubdomain(domain, chatId, path){

    path = __dirname;

    try {
        if(fs.existsSync(path + '/output/subdomains.txt')){
            fs.unlinkSync(path + '/output/subdomains.txt');
            execution(path, domain, chatId);
        }else{
            execution(path, domain, chatId);
        }

    } catch (error) {
        console.log(error);
        return;
    }

};


//Bot Functions

bot.on('polling_error', function(error){
    console.log(error);
});

bot.onText(/^\/start/, function(msg){
    var chatId = msg.chat.id;
    var nameUser = msg.from.first_name;

    bot.sendMessage(chatId, "Welcome " + nameUser);
});


bot.onText(/\/domain (.+)/, async(msg, match) => {
    const chatId = msg.chat.id;
    const domain = match[1];

    bot.sendMessage(chatId, "[+] Searching subdomains from " + domain);

    await getSubdomain(domain, chatId);

});
