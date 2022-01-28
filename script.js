
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

function zScale (aa) {
    const aas = "FWILVMYPACTSQGHKREND";
    zData = [[4.92, 1.3, 0.45],
        [4.75, 3.65, 0.85],
        [4.44, -1.68, -1.03],
        [4.19, -1.03, -0.98],
        [-2.69, -2.53, -1.29],
        [-2.49, -0.27, -0.41],
        [-1.39, 2.32, 0.01],
        [-1.22, 0.88, 2.23],
        [0.07, -1.73, 0.09],
        [0.71, -0.97, 4.13],
        [0.92, -2.09, -1.4],
        [1.96, -1.63, 0.57],
        [2.19, 0.53, -1.14],
        [2.23, -5.36, 0.3],
        [2.41, 1.74, 1.11],
        [2.84, 1.41, -3.14],
        [2.88, 2.52, -3.44],
        [3.08, 0.039, -0.07],
        [3.22, 1.45, 0.84],
        [3.64, 1.13, 2.36]];
    return zData[aas.indexOf(aa)];
};

function zScore (seq1, seq2) {
    let score = 0;
    for (let i=0; i<seq1.length; i++) {
        zs1 = zScale(seq1[i]);
        zs2 = zScale(seq2[i]);
        for (let j=0; j<3; j++) {
            let diff = zs1[j] - zs2[j];
            score += diff * diff;
        };
    };
    return Math.sqrt(score);
};


function generateAllZScores (seq1) {
    const aas = "ACDEFGHIKLMNPQRSTVWY";
    const scoreData = [];
    let seq2a = '';
    let seq2b = '';
    let seq2c = '';
    let seq2 = '';
    let score = 0
    for (let i = 0; i<aas.length; i++) {
        seq2a = aas.substr(i, 1);
        for (let j = 0; j<aas.length; j++) {
            seq2b = seq2a + aas.substr(j, 1);
            for (let k = 0; k<aas.length; k++) {
                seq2c = seq2b + aas.substr(k, 1);
                for (let l = 0; l<aas.length; l++) {
                    seq2 = seq2c + aas.substr(l, 1);
                    score = zScore(seq1, seq2);
                    scoreData.push([seq2, score])
                };
            };
        };
    };
    scoreData.sort(function(a, b){return a[1] - b[1]});
    for (let i=0; i<scoreData.length; i++) {
        allPeptides[i] = scoreData[i][0];
        allScores[i] = scoreData[i][1];
    }
    maxScore = allScores[allScores.length - 1];
};

function IC50 (score) {
    return Math.pow(10, (-9 + 6 * (score / maxScore))) * 10**9;
};

function randomAA () {
    const aas = "ACDEFGHIKLMNPQRSTVWY";
    const k = Math.floor(Math.random() * aas.length);
    return aas.substr(k, 1);
};

function randomPeptide (nAA) {
    const pepSeq = []
    for (let i=0; i<nAA; i++) {
        pepSeq.push(randomAA());
    }
    return pepSeq.join('');
};

function readPeptide () {
    let pepSeq = prompt("Sequence:");
    let pepCode = encrypt(pepSeq);
    while (pepCode === -1) {
        pepSeq = prompt("Invalid sequence, try again:");
        pepCode = encrypt(pepSeq);
    }
    console.log(pepSeq, pepCode, decrypt(pepCode));
    return pepSeq;
}

function readGameCode() {
    let pepCode = prompt("Game Code:");
    let pepSeq = decrypt(pepCode);
    while (pepSeq.length != 4) {
        pepCode = prompt("Invalid game code, try again:");
        pepSeq = decrypt(pepCode);
    }
    console.log(pepSeq, pepCode);
    return pepSeq;
}

function generateRelatedPeptides (seq, nSeqs) {
    seqs = [];
    const i = allPeptides.indexOf(seq);
    do {
        const k = Math.floor(Math.random() * seq.length);
        let pre = (k > 0) ? seq.slice(0, k) : '';
        let post = (k < 3) ? seq.slice(k+1) : '';
        let aa = seq[k];
        let bb = aa;
        while (bb === aa) {
            bb = randomAA();
        };
        seq2 = pre + bb + post;
        const j = allPeptides.indexOf(seq2);
        if (j > i) {
            if (seqs.indexOf(seq2) === -1) {
                seqs.push(seq2);
            };
        };
    } while (seqs.length < nSeqs);
    return seqs;
};

function initializeTableData (nInitialSeqs) {
    seqIDs = [];
    seqICs = [];
    const iMid = allPeptides.length / 4;
    seqIDs[0] = allPeptides[iMid];
    seqICs[0] = IC50(allScores[iMid]).toFixed(0);
    const rPeps = generateRelatedPeptides(seqIDs[0], nInitialSeqs - 1);
    for (let i = 1; i < nInitialSeqs; i++) {
        const randomSeq = rPeps[i - 1];
        seqIDs[seqIDs.length] = randomSeq;
        const score = allScores[allPeptides.indexOf(randomSeq)];
        seqICs[seqICs.length] = IC50(score).toFixed(0);
    };
};

function appendTableData (pepSeqs) {
    for (let i = 0; i < pepSeqs.length; i++) {
        seqIDs[seqIDs.length] = pepSeqs[i];
        const score = allScores[allPeptides.indexOf(pepSeqs[i])];
        seqICs[seqICs.length] = IC50(score).toFixed(0);
    };
};

function clearTable() {
    const seqTable = document.querySelector("tbody");
    const rows = seqTable.querySelectorAll("tr");
    rows.forEach((row) => {
        seqTable.removeChild(row);
    });
};

function fillTable () {
    const seqTable = document.querySelector("tbody");
    for (let i = 0; i < seqIDs.length; i++) {
        let row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.textContent = seqIDs[i];
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.textContent = seqICs[i];
        row.appendChild(cell);
        seqTable.appendChild(row)
    };
};

function updateTable () {
    clearTable();
    fillTable();
}

function findBest () {
    let iBest = 0;
    for (let i = 1; i < seqICs.length; i++) {
        if (parseFloat(seqICs[i]) < parseFloat(seqICs[iBest])) {
            iBest = i;
        };
    };
    return iBest;
};

function reportBest () {
    const iBest = findBest();
    const best = document.querySelector("[id=best]");
    best.textContent = `best peptide so far: ${seqIDs[iBest]} IC50 = ${seqICs[iBest]} nM`;
};

function clearInputSequences () {
    const sequenceInputValues = document.querySelector('[id=seqvals]');
    const sequenceinputs = sequenceInputValues.querySelectorAll('tetselect');
    sequenceinputs.forEach((sequenceInputValue) => {
        sequenceInputValues.removeChild(sequenceInputValue);
    });

};

function setRequestSize (nSeqs) {
    const requestsize = document.querySelector('[id=npeptides]');
    const opts = requestsize.querySelectorAll('option');
    opts.forEach((opt) => {
        requestsize.removeChild(opt);
    });
    for (let i=1; i<= nSeqs; i++) {
        const opt = document.createElement('option');
        opt.setAttribute('value', i);
        opt.textContent = i;
        requestsize.appendChild(opt);
    };
    
};

function fillInputSequences (nSeqs, initial=null) {
    const sequenceInputValues = document.querySelector("[id=seqvals]");
    for (let i = 0; i < nSeqs; i++) {
        if (initial) {
            tetsel = tetSelector(`t${i}`, initial);
        } else {
            tetsel = tetSelector(`t${i}`);
        };
        sequenceInputValues.appendChild(tetsel);
    };
    const requestCost = document.querySelector('.sequencecost');
    requestCost.textContent = `Cost: ${1 + Number(nSeqs)} credits`;
};

function aaSelector (id, selected=null) {
    const aas = "ACDEFGHIKLMNPQRSTVWY";
    const select = document.createElement('select');
    select.setAttribute('id', id);
    select.setAttribute('name', id);
    select.setAttribute('size', "1");
    for (let i=0; i< aas.length; i++) {
        aa = aas.substr(i, 1);
        const option = document.createElement('option');
        option.setAttribute('value', aa);
        if (aa === selected) {
            option.setAttribute('selected', true);
        }
        option.textContent = aa;
        select.appendChild(option);
    };
    return select;
};

function tetSelector (id, selected=null) {
    const tetsel = document.createElement('tetselect');
    tetsel.setAttribute('id', id);
    for (let i=0; i<4; i++) {
        if (selected) {
            aasel = aaSelector(`${id}${i}`, selected[i]);
        } else {
            aasel = aaSelector(`${id}${i}`);
        }
        tetsel.appendChild(aasel);
    };
    return tetsel;
};

function resetInputSequences (nSeq, initial=null) {
    clearInputSequences();
    setRequestSize(nSeq);
    fillInputSequences(nSeq, initial);
    const nPeptides = document.getElementById('npeptides');
    nPeptides.value = nSeq;
    
};

function readInputSequences () {
    const nPeptides = document.getElementById('npeptides');
    nSeq = nPeptides.value;
    const tetseqs = document.querySelectorAll('tetselect');
    let seqs = [];
    tetseqs.forEach((tetseq) => {
        let seq = [];
        aas = tetseq.querySelectorAll('select');
        aas.forEach((aa) => {
            seq[seq.length] = aa.value;
        });
        seqs[seqs.length] = seq.join('');
    });
    return seqs;
};

function disableMakeButton () {
    const synthButton = document.getElementById('makebutton');
    synthButton.setAttribute('disabled', true);
};

function disableSubmitButton () {
    const synthButton = document.getElementById('submitbutton');
    synthButton.setAttribute('disabled', true);
};

function enableMakeButton () {
    const synthButton = document.getElementById('makebutton');
    synthButton.removeAttribute('disabled');
};

function setCredit (credit) {
    const element = document.querySelector('.credits');
    element.textContent = `Remaining credit: ${credit}`;
};

function setScore (index, baseIndex) {
    const element = document.querySelector('.score');
    const score = (1 - index/baseIndex) * 100;
    element.textContent = `Score: ${score}`;
};

const nPeptides = document.getElementById('npeptides');
nPeptides.addEventListener('change', (e) => {
    const nPeps = e.target.value;
    clearInputSequences();
    iBest = findBest();
    fillInputSequences(nPeps, seqIDs[iBest]);
});

function play () {
    credit = 20;
    setCredit(credit);
    //targetSeq = randomPeptide(4);
    //targetSeq = readPeptide();
    targetSeq = readGameCode();
    generateAllZScores(targetSeq);
    initializeTableData(10);
    let iBest = findBest();
    baseIndex = allPeptides.indexOf(seqIDs[iBest]);
    setScore(baseIndex, baseIndex);
    resetInputSequences(Math.min(4, credit), seqIDs[iBest]);
    updateTable();
    reportBest();
};

const synthButton = document.getElementById('makebutton');
synthButton.addEventListener('click', (e) => {
    const seqs = readInputSequences();
    appendTableData(seqs);
    updateTable();
    reportBest();
    iBest = findBest();
    const index = allPeptides.indexOf(seqIDs[iBest]);
    credit -= (seqs.length + 1);
    setCredit(credit);
    setScore(index, baseIndex);
    resetInputSequences(Math.min(4, credit - 1), seqIDs[iBest]);
    if (credit < 2) {
        disableMakeButton();
    };
} );

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => {
    const iBest = findBest();
    const bestSeq = seqIDs[iBest];
    if (confirm(`Your best peptide is ${bestSeq} \n the ideal peptide would have been ${targetSeq}\n Click OK to play again`)) {
        enableMakeButton();
        play();
    } else {
        disableMakeButton();
        disableSubmitButton();
        alert('GAME OVER, THANKS FOR PLAYING');
    };
});

const nInitialSeqs = 10;
let seqIDs = [];
let seqICs = [];
let allPeptides = [];
let allScores = [];
let targetSeq = 'AAAA';
let credit = 20;
let maxScore = 0;
let baseIndex = 0;
play();
