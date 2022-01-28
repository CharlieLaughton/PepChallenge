const encrypt = (text) => {
    const aas = "FWILVMYPACTSQGHKREND";
    let code = 0;
    for (let i = 0; i<text.length; i++) {
        let j = aas.indexOf(text.substr(i, 1));
        if (j === -1) {
            return -1
        }
        code = code * 20;
        code = code + j;
    }
    return code
};

const decrypt = (data) => {
    const aas = "FWILVMYPACTSQGHKREND";
    let text = ""
    while (data > 0) {
        j = data % 20
        text = (aas.substr(j, 1)) + text;
        data = data - j;
        data = data / 20;
    };
    return text;
};

function readPeptide () {
    let pepSeq = prompt("Sequence:");
    let pepCode = encrypt(pepSeq);
    while (pepCode === -1) {
        pepSeq = prompt("Invalid sequence, try again:");
        pepCode = encrypt(pepSeq);
    }
    //console.log(pepSeq, pepCode, decrypt(pepCode));
    return [pepSeq, pepCode];
}

const [pepSeq, pepCode] = readPeptide();
console.log(pepSeq, pepCode);
const seq = document.getElementById("sequence");
seq.innerHTML = pepSeq;
const code = document.getElementById("code");
code.innerHTML = pepCode;
