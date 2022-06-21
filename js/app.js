import {ExperimentParameters} from "./modules/exp.js";
import {Instructions} from "./modules/inst.js";
import {Questionnaire} from "./modules/quest.js";
import {ChoiceManager, SliderManager} from "./modules/trial_manager.js";
import {sendToDB} from "./modules/request.js"


// When the page is fully loaded, the main function will be called
$(document).ready(main);


function main() {
    /*
    Main function where
    we instantiate experiment parameters, in order to maintain
    their attributes throught the whole experiment scope
    TODO:
        * ???
        * Init dictionnaries instead of arrays
     */

    // initGameStageDiv main parameters
    /* ============================================================================= */
    // these three variables indicate what
    // has to be run in the state machine (i.e. current state of the experiment)
    // initial values are:
    // let sessionNum = -1;
    // let phaseNum = 1;
    // let instructionNum = 0;
    // let questNum = 0;
    let sessionNum = 1;
    let seasonNum = 0;
    let instructionNum = 0;//'end';

    // instantiate experiment parameters
    let exp = new ExperimentParameters(
        {
            online: true,   // send network requests
            isTesting: true, // isTesting==in development vs in production
            expName: 'EcologicalRange', // experience name
            maxCompensation: 250, // in pence (in addition of the initial endowment)
            feedbackDuration: 1500, // how many milliseconds we present the outcome
            beforeFeedbackDuration: 1000, // how many milliseconds before the outcome
            nSeasons: 30,
	    nTrialsPerSeason: 10,
	    nArms: 20,
	    imgPath: 'images/cards_gif/',
            compLink: 'https://app.prolific.ac/submissions/complete?cc=RNFS5HP5' // prolific completion link
                                                                                // will be displayed at the end
        }
    );
    
    // Run experiment!!
    stateMachine({instructionNum, sessionNum, seasonNum, exp});
}


function stateMachine({instructionNum, sessionNum, seasonNum, exp} = {}) {

    let inst = new Instructions(exp);
    let quest = new Questionnaire(exp);

    /* ============================ Instructions Management ========================== */

    // if sessionNum < 0, then it is a training session
    // here training sessionNum is in {-1, -2}
    let isTraining = +(sessionNum < 0);
    let isLastSession = +(sessionNum === (exp.nSession-1));

    switch (instructionNum) {
        case 0:
            inst.goFullscreen(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 1, exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 1:
            inst.setUserID(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 2, exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 2:
            inst.displayConsent(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 3, exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 3:
            inst.displayInitialInstruction(
                {pageNum: 1},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 4:
            inst.displayInstructionLearning(
                {pageNum: 1, isTraining: isTraining, seasonNum: 1, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 5:
            inst.displayInstructionChoiceElicitation(
                {pageNum: 1, isTraining: isTraining, seasonNum: 2, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
            );
            return;

        case 6:
            inst.displayInstructionSliderElicitation(
                {pageNum: 1, isTraining: isTraining, seasonNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, seasonNum: 0
                }
             );
            return;
        case 7:
            inst.endTraining(
                {pageNum: 1, isTraining: 1, seasonNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: 0, seasonNum: 0
                }
            );
            return;
        case 8:
            inst.endExperiment(
                {pageNum: 1, isTraining: 1, seasonNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, seasonNum: 'end'
                }
            );
            return;
        case 9:
            inst.displayInstructionQuestionnaire(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: 0, seasonNum: 'end'
                }
            );
            return;
        case 10:
            inst.nextSession(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: sessionNum, seasonNum: seasonNum
                }
            );
            return;


        case 'end':
        case undefined:
            break;

        default:
            error('Instructions: non-expected state');
    }

    /* ============================ Test Management ================================ */

    let choice;

    let nextParams = {
        instructionNum: 'end',
        sessionNum: sessionNum,
        seasonNum: seasonNum+1,
        exp: exp,
    }
    if (seasonNum==exp['nSeasons']){
	nextParams['instrutionNum'] = 5;
    }

    choice = new ChoiceManager(
        {
            feedbackDuration: exp.feedbackDuration,
            beforeFeedbackDuration: exp.beforeFeedbackDuration,
            sessionNum: sessionNum,
            seasonNum: seasonNum,
            exp: exp,
            // what will be executed next
            nextFunc: stateMachine,
            nextParams: nextParams
        }
    );
    console.debug('Start Seasons :'+seasonNum.toString());
    //Store the actual season in db
    if (exp.online){
	console.log('send season db');
	sendToDB(0,
		 {
                     expID: exp.expID,
                     id: exp.subID,
                     exp: exp.expName,
                     browser: exp.browsInfo,
		     minRew: exp.minRange[seasonNum].toString(),
		     maxRew: exp.maxRange[seasonNum].toString(),
		     ranks: exp.ranks,
		     rewards:seasonNum
		 },
		 'php/InsertSeasonDetails.php'
		);
    }
    choice.run();
}
