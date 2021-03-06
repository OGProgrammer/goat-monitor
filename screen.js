const Nightmare = require('nightmare');
const nodemailer = require("nodemailer");
const fs = require('fs');

const config = require(__dirname + '/config.json');

var myArgs = process.argv.slice(2);
targetUri = myArgs[0];
targetSize = myArgs[1];

dataPath = __dirname + '/savedData.json';
// Check for last run file
firstRun = null;
shoeData = null;

try {
    if (fs.existsSync(dataPath)) {
        //file exists
        firstRun = false;
        shoeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
        firstRun = true;
        shoeData = {};
    }
} catch (err) {
    console.error(err)
}

nightmare = Nightmare({
    show: false,
    dock: false,
    width: 1280,
    height: 768
});
nightmare
    .goto(targetUri)
    .inject('js', __dirname + '/node_modules/jquery/dist/jquery.js')
    .wait('span[data-qa="show-filters"]')
    .click('span[data-qa="show-filters"]')
    .wait('span[data-qa="us-sizes"]')
    .evaluate((targetSize) => {
            $(`div[data-qa='size-cell']`)
                .filter(function () {
                    return $(this).text() === targetSize;
                }).click().delay(5000);
        }
        , targetSize)
    .wait(5000)
    .evaluate(() => {
        return $(`[data-qa="search-result-num"]`)[0].innerText;
    })
    .end()
    .then((text) => {
        text = text.replace("Showing ", "");
        text = text.replace(" Results", "");
        if (targetUri in shoeData) {
        } else {
            shoeData[targetUri] = {};
        }
        if (text == "25" || text == "0") {
            // Something is up cause we should have less than 25 or 0 probably means we got blocked
        } else {
            if (!firstRun) {
                if (targetSize in shoeData[targetUri]) {
                    if (text !== shoeData[targetUri][targetSize]) {
                        sendEmail(targetSize, targetUri, shoeData[targetUri][targetSize], text);
                    }
                }
            }
            shoeData[targetUri][targetSize] = text;
            fs.writeFileSync(dataPath, JSON.stringify(shoeData));
        }
    })
    .catch(error => {
        console.error('Search failed:', error)
    });


// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(newListingOnSize, url, oldCount, newCount) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure, // true for 465, false for other ports
        auth: {
            user: config.smtp.username, // generated ethereal user
            pass: config.smtp.password, // generated ethereal password
        },
        requireTLS: true,
        // logger: true,
        // debug: true
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: config.smtp.from, // sender address
        to: config.smtp.to, // list of receivers
        subject: "New Listing Found on GOAT", // Subject line
        text: `Listing Count Changed from ${oldCount} to ${newCount} for size ${newListingOnSize}, visit ${url} to check it out.`, // plain text body
        html: `Listing Count Changed from ${oldCount} to ${newCount} for size <b>${newListingOnSize}</b>, <a href="${url}">click here</a> to check it out. ${url}`, // html body
    });
}
