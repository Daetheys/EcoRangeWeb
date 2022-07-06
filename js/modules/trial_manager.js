import {sendToDB} from "./request.js"
import {randint, shuffle, range} from "./utils.js";
import {GUI} from "./gui.js";


export class ChoiceManager {
    /*
    Manage trials with 2 options
    Private methods are prefixed with _
     */
    constructor({
	feedbackDuration,
	beforeFeedbackDuration,
	sessionNum,
        seasonNum,
        exp,
        nextFunc,
        nextParams
    } = {}) {

        // members
        this.exp = exp;

        this.sessionNum = sessionNum;
        this.seasonNum = seasonNum;

        this.feedbackDuration = feedbackDuration;
        this.beforeFeedbackDuration = this.exp.beforeFeedbackDuration;
	
        this.nextFunc = nextFunc;
        this.nextParams = nextParams;

        // initGameStageDiv non parametric variables
        this.trialNum = 0;

	this.nTrial = this.exp['nTrialsPerSeason'];

        if (this.exp.isTesting) {
            this._isTesting();
        }

        this.skip = undefined;
        this.skipEnabled = this.exp.isTesting;

	const shuffleArray = array => {
	    for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	    }
	}
	
	this.ranks = Array.from(Array(this.exp['nArms']).keys());
	shuffleArray(this.ranks);

	this.rewards = [];
	for (let i=0;i<this.ranks.length;i++){
	    this.rewards.push(this.exp.rewards[this.seasonNum][this.ranks[i]]);
	}

	this.colors = ['#F0FFFF','#F0F8FF','#FFFAF0','#F8F8FF','#F0FFF0','#FFFFF0','#F5FFFA','#FDF5E6','#FFFAFA','#FFF5EE','#F5F5F5']
	this.color = this.colors[Math.trunc(Math.random()*this.colors.length)]

    }

    /* =================== public methods ================== */

    
    run() {

        GUI.initGameStageDiv();

        let presentationTime = (new Date()).getTime();

        let params = {
	    rewards:this.rewards,
	    ranks:this.ranks
        };

        GUI.displayOptions(params);

        let clickEnabled = true;

	for (let i=0; i<20; i++){
	    $('#td'+i.toString())[0].style.backgroundColor = this.color;
            $('#td'+i.toString()).click({obj: this}, function (event) {
		if (!clickEnabled)
                    return;
		clickEnabled = false;
		event.data.obj.skipEnabled = false;
		this.style.borderColor = "#32ae97";
		event.data.obj._clickEvent(i, params);
            });
	}

    };


    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, params){

	let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];

        let ret =  this._getReward(choice, params);
	let reward = ret[0];
	let rank = ret[1];
        this._showReward(reward, choice);
	if (this.exp.online) {
            sendToDB(0,
                     {
			 exp: this.exp.expName,
			 expID: this.exp.expID,
			 id: this.exp.subID,
			 test: +(this.exp.isTesting),
			 season: this.seasonNum,
			 trial: this.trialNum,
			 choice: choice,
			 reward: reward,
			 rank: rank,
			 reaction_time: reactionTime,
			 rewardTot: this.exp.totalReward,
			 session: this.sessionNum,
			 choice_time: choiceTime - this.exp.initTime,
                     },
                     'php/InsertLearningDataDB.php'
		    );
	}
        setTimeout(function (event) {
            event.obj.next()
        }, this.feedbackDuration, {obj: this});
    }

    _getReward(choice, params) {

        let reward = params["rewards"][choice]
	let rank = params["ranks"][choice]

        this.exp.rewardsPerSeason[this.seasonNum] += reward;
	this.exp.ranksPerSeason[this.seasonNum] += rank;

        // if session is not training add to total reward
        this.exp.totalReward += reward;
	this.exp.totalRank += rank;

        return [reward,rank];

    };

    _showReward(reward, choice) {
        GUI.showFeedback(reward,choice);
    }

    next(nTrial = undefined) {
        if (nTrial !== undefined) {
            GUI.hideOptions();
            this.trialNum = nTrial;
            setTimeout(function (event) {
                if (nTrial === event.obj.nTrial) {
                    event.obj.next();
                } else {
                    event.obj.run();
                }
            }, 500, {obj: this});
            return;
        }
        this.trialNum++;
        if (this.trialNum < this.nTrial) {
            GUI.hideOptions();
            setTimeout(function (event) {
                event.obj.run();
            }, 200, {obj: this});
        } else {
            GUI.hideSkipButton();
            $('#TextBoxDiv').fadeOut(500);
	    /*if (this.nextParams['instructionNum'] != 8){
		setTimeout(function (event) {
                    $('#Stage').empty();
		    GUI.newSeasonShow();
		}, 500, {obj: this});
		setTimeout(function (event) {
		    GUI.newSeasonRemove();
		}, 2500, {obj: this});
	    }*/
	    setTimeout(function (eventb) {
		eventb.obj.nextFunc(eventb.obj.nextParams);
		}, 500, {obj: this});
	    //this.nextFunc(this.nextParams);
        }
    };
}


export class SliderManager {

    constructor({
                    exp,
                    trialObj,
                    imgObj,
                    sessionNum,
                    phaseNum,
                    feedbackDuration,
                    elicitationType,
                    nextFunc,
                    nextParams
                } = {}) {
        // members
        this.exp = exp;
        this.trialObj = trialObj;
        this.nTrial = trialObj.length;

        this.sessionNum = sessionNum;
        this.phaseNum = phaseNum;

        this.imgObj = imgObj;
        this.trialNum = 0;

        this.invertedPosition = shuffle(
            Array.from(Array(this.nTrial), x => randint(0, 1))
        );

        this.feedbackDuration = feedbackDuration;

        this.elicitationType = elicitationType;

        this.nextFunc = nextFunc;
        this.nextParams = nextParams;

        if (this.exp.isTesting) {
            this._isTesting();
        }
        this.skip = undefined;
        this.skipEnabled = true;
    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        this.skipEnabled = true;

        let trialObj = this.trialObj[this.trialNum];

        let presentationTime = (new Date()).getTime();

        let params = {
            stimIdx: trialObj[0],
            contIdx: trialObj[1],
            p1: trialObj[2],
            ev1: trialObj[3],
            r1: trialObj[4],
            isCatchTrial: trialObj[5],
            option1Type: trialObj[6],
            option2Type: trialObj[7],
            presentationTime: presentationTime
        };


        let initValue = range(25, 75, 5)[Math.floor(Math.random() * 10)];
        let clickEnabled = true;

        let slider = GUI.displayOptionSlider(params['stimIdx'], this.imgObj, initValue);

        GUI.listenOnSlider({obj: this, slider: slider}, function (event) {
            if (clickEnabled) {
                clickEnabled = false;
                event.data.obj.skipEnabled = false;
                let choice = slider.value;
                event.data.obj._clickEvent(choice, params);
            }
        });

    };

    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, params) {

        let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];
        let invertedPosition = this.invertedPosition[this.trialNum];
        let ev1 = params["ev1"];
        let p1 = params["p1"][1];
        let contIdx = params['contIdx'];
        let stimIdx = params['stimIdx'];
        let isCatchTrial = +(params["isCatchTrial"]);
        let option1Type = params['option1Type'];

        let [correctChoice, thisReward,
            otherReward, pLottery, elicDistance] = this._getReward(choice, params);

        if (this.exp.online) {
            sendToDB(0,
                {
                    exp: this.exp.expName,
                    expID: this.exp.expID,
                    id: this.exp.subID,
                    test: +(this.exp.isTesting),
                    trial: this.trialNum,
                    elicitation_type: this.elicitationType,
                    cont_idx_1: contIdx,
                    cont_idx_2: -1,
                    condition: -1,
                    symL: stimIdx,
                    symR: -1,
                    choice: choice,
                    correct_choice: correctChoice,
                    outcome: thisReward,
                    cf_outcome: otherReward,
                    choice_left_right: -1,
                    reaction_time: reactionTime,
                    reward: this.exp.totalReward,
                    session: this.sessionNum,
                    p1: p1,
                    p2: -1,
                    option1: option1Type,
                    option2: -1,
                    ev1: Math.round(ev1 * 100) / 100,
                    ev2: -1,
                    iscatch: isCatchTrial,
                    inverted: invertedPosition,
                    choice_time: choiceTime - this.exp.initTime,
                    elic_distance: elicDistance,
                    p_lottery: pLottery
                },
                'php/InsertLearningDataDB.php'
            );
        }

        this.next();

    }

    _getReward(choice, params) {

        let p1 = params["p1"];
        let r1 = params["r1"];
        let thisReward = undefined;

        let pLottery = Math.random().toFixed(2);
        if (pLottery < (choice / 100)) {
            thisReward = r1[+(Math.random() < p1[1])];
        } else {
            thisReward = r1[+(Math.random() < pLottery)]
        }
        let otherReward = -1;

        let correctChoice = +((choice / 100) === p1[1]);
        let elicDistance = Math.abs(choice - p1[1] * 100);

        this.exp.sumReward[this.phaseNum] += thisReward;

        this.exp.totalReward += thisReward * !([-1, -2].includes(this.sessionNum));

        return [correctChoice, thisReward, otherReward, pLottery, elicDistance]

    };

    next(nTrial = undefined) {
        if (nTrial !== undefined) {
            GUI.hideOptions();
            this.trialNum = nTrial;
            setTimeout(function (event) {
                if (nTrial === event.obj.nTrial) {
                    event.obj.next();
                } else {
                    event.obj.run();
                }
            }, 500, {obj: this});
            return;
        }
        this.trialNum++;
        if (this.trialNum < this.nTrial) {
            setTimeout(function (event) {
                GUI.hideOptions();
                setTimeout(function (event) {
                    event.obj.run();
                }, 500, {obj: event.obj});
            }, this.feedbackDuration, {obj: this});
        } else {
            GUI.hideSkipButton();
            setTimeout(function (event) {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function (event) {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        event.obj.nextFunc(event.obj.nextParams);
                    }, 500, {obj: event.obj})
                }, this.feedbackDuration, {obj: this}
            );
        }
    };
}
