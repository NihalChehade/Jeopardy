// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

function handlePageLoad() {

    const pgeTitle = $('<h1 class="page-header"></h1>');
    pgeTitle.text('Jeopardy!');

    const btn = $('<button id="btn-start"></button><br>');
    btn.text('Start!');
    $('body').append(pgeTitle);
    $('body').append(btn);


}
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {

    const res = await axios.get('https://jeopardy-api-08c22fd2e683.herokuapp.com/api/categories');
    
    let categories_ids = [];

    for (category in res.data.categories) {
        categories_ids.push(res.data.categories[category].id);
    }
    const NUM_CATEGORIES = _.sampleSize(categories_ids, 6);
    console.log(NUM_CATEGORIES);
    return NUM_CATEGORIES;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    console.log(catId);
    const resp = await axios.get(`https://jeopardy-api-08c22fd2e683.herokuapp.com/api/details/${catId}`);

    const category = {
        title: resp.data.details[catId].title,
        clues: [
            { question: resp.data.details[catId].clues[0].question, answer: resp.data.details[catId].clues[0].answer, showing: null },
            { question: resp.data.details[catId].clues[1].question, answer: resp.data.details[catId].clues[1].answer, showing: null },
            { question: resp.data.details[catId].clues[2].question, answer: resp.data.details[catId].clues[2].answer, showing: null },
            { question: resp.data.details[catId].clues[3].question, answer: resp.data.details[catId].clues[3].answer, showing: null },
            { question: resp.data.details[catId].clues[4].question, answer: resp.data.details[catId].clues[4].answer, showing: null }
        ]
    };

    return category;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const tble_elmnt = $('<table id="main-table"></table>');
    const thead_elmnt = $('<thead></thead>');
    const th_tr_elmnt = $('<tr></tr>');
    const tbody_elmnt = $('<tbody></tbody>');
    const tbody_tr0_elmnt = $('<tr id="0"></tr>');
    const tbody_tr1_elmnt = $('<tr id="1"></tr>');
    const tbody_tr2_elmnt = $('<tr id="2"></tr>');
    const tbody_tr3_elmnt = $('<tr id="3"></tr>');
    const tbody_tr4_elmnt = $('<tr id="4"></tr>');

    tbody_elmnt.append(tbody_tr0_elmnt);
    tbody_elmnt.append(tbody_tr1_elmnt);
    tbody_elmnt.append(tbody_tr2_elmnt);
    tbody_elmnt.append(tbody_tr3_elmnt);
    tbody_elmnt.append(tbody_tr4_elmnt);
    thead_elmnt.append(th_tr_elmnt);
    tble_elmnt.append(thead_elmnt);
    tble_elmnt.append(tbody_elmnt);
    $('body').append(tble_elmnt);

    for (catIndx in categories) {
        const th_td_elmnt = $('<td></td>');
        console.log(categories[catIndx].title);
        th_td_elmnt.text(categories[catIndx].title);
        th_tr_elmnt.append(th_td_elmnt);

        for (clueIndx in categories[catIndx].clues) {
            const tbody_td_elmnt = $(`<td id="${catIndx}-${clueIndx}"}></td>`);
            tbody_td_elmnt.text('?');
            $(`#${clueIndx}`).append(tbody_td_elmnt);
        }
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(catIdx_clueIdx) {
    const idArr = catIdx_clueIdx.split('-');
    const catIdx = parseInt(idArr[0]);
    const clueIdx = parseInt(idArr[1]);


    if ($(`#${catIdx_clueIdx}`).text() === '?') {

        $(`#${catIdx_clueIdx}`).text(categories[catIdx].clues[clueIdx].question);
        categories[catIdx].clues[clueIdx].showing = 'question';

    } else if ($(`#${catIdx_clueIdx}`).text() === categories[catIdx].clues[clueIdx].question) {
        $(`#${catIdx_clueIdx}`).css("background", "#28a200");
        $(`#${catIdx_clueIdx}`).text(categories[catIdx].clues[clueIdx].answer);
        categories[catIdx].clues[clueIdx].showing = 'answer';
        $(`#${catIdx_clueIdx}`).css('cursor', 'no-drop');
    }

}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

    $("#main-table").remove();
    categories = [];
    const spnr = $('<img id="spnr-img" src="https://i.gifer.com/Vp3R.gif"/>');

    $('body').append(spnr);

    $('#btn-start').text('Restart!');

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#spnr-img').remove();

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const ids = await getCategoryIds();
    for (idIndx in ids) {

        const category = await getCategory(ids[idIndx]);

        categories.push(category);
    }
    fillTable();
    hideLoadingView()
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO




$(document).ready(handlePageLoad);

$(document).on('click', function (e) {

    if (e.target.id === 'btn-start') {
        showLoadingView();
        setupAndStart();
    } else if (e.target.id.indexOf('-')) {

        handleClick(e.target.id);
    }

});