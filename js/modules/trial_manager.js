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
	    ranks:this.ranks,
        presentationTime:presentationTime
        };

        GUI.displayOptions(params);

        let clickEnabled = true;

        this.sat_feedbacks = {0:true,9:true};
        this.range_feedbacks = {0:true,9:true};

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
        
        //Next trial
        //Put satisfaction slider
        if (this.sat_feedbacks[this.trialNum] && this.exp.satisfaction_feedbacks){
            this.sat_feedbacks[this.trialNum] = false;
            var slider = new SliderManager({
                exp: this.exp,
                cm: this});
            slider.run();
            return;
        }
        //Put range slider
        if (this.range_feedbacks[this.trialNum] && this.exp.range_feedbacks && !(this.exp.seasonNum == 0 && this.trialNum == 0)){
            this.range_feedbacks[this.trialNum] = false;
            var rangem = new RangeManager({
                exp: this.exp,
                cm: this});
            rangem.run();
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
                    cm,
                } = {}) {
        // members
        this.exp = exp;
        this.nTrial = 1;
        this.trialNum = 0;
        this.cm = cm;
        /*this.trialObj = trialObj;
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
        this.skipEnabled = true;*/
    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        /*this.skipEnabled = true;

        let trialObj = this.trialObj[this.trialNum];*/

        let presentationTime = (new Date()).getTime();


        let initValue = Math.floor(Math.random() * 100);
        let clickEnabled = true;

        let params = {
            initValue:initValue,
            presentationTime:presentationTime
        };

        let slider = GUI.displayOptionSlider(undefined,undefined,initValue);//params['stimIdx'], this.imgObj, 50);

        GUI.listenOnSlider({obj: this, slider: slider}, function (event) {
            if (clickEnabled) {
                clickEnabled = false;
                event.data.obj.skipEnabled = false;
                let choice = slider.value;
                event.data.obj._clickEvent(choice, initValue, params);
            }
        });

    };

    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, initv, params) {

        let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];
        /*let invertedPosition = this.invertedPosition[this.trialNum];
        let ev1 = params["ev1"];
        let p1 = params["p1"][1];
        let contIdx = params['contIdx'];
        let stimIdx = params['stimIdx'];
        let isCatchTrial = +(params["isCatchTrial"]);
        let option1Type = params['option1Type'];

        let [correctChoice, thisReward,
            otherReward, pLottery, elicDistance] = this._getReward(choice, params);
        */
        if (this.exp.online) {
            sendToDB(0,
            {
                exp: this.exp.expName,
                expID: this.exp.expID,
                id: this.exp.subID,
                test: +(this.exp.isTesting),
                season: this.cm.seasonNum,
                trial: this.cm.trialNum,
                value: choice,
                initv: initv,
                reaction_time: reactionTime,
                session: this.cm.sessionNum,
                choice_time: choiceTime - this.exp.initTime,
            },
            'php/InsertSlider.php'
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
                        event.obj.cm.next();
                        //event.obj.nextFunc(event.obj.nextParams);
                    }, 500, {obj: event.obj})
                }, this.feedbackDuration, {obj: this}
            );
        }
    };
}

export class RangeManager {

    constructor({
                    exp,
                    cm,
                } = {}) {
        // members
        this.exp = exp;
        this.nTrial = 1;
        this.trialNum = 0;
        this.cm = cm;
        /*this.trialObj = trialObj;
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
        this.skipEnabled = true;*/
    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        /*this.skipEnabled = true;

        let trialObj = this.trialObj[this.trialNum];*/

        let presentationTime = (new Date()).getTime();

        let clickEnabled = true;

        let params = {
            presentationTime:presentationTime
        };

        let d = GUI.displayTextInput();
        let textInput1 = d.textInput1;
        let textInput2 = d.textInput2;

        GUI.listenOnTextInput({obj: this, textInput1: textInput1, textInput2: textInput2}, function (event) {
            if (clickEnabled) {
                let choice = textInput1.value;
                let choice2 = textInput2.value;
                textInput1.setCustomValidity("");
                textInput2.setCustomValidity("");
                if (choice.length == 0){
                    textInput1.setCustomValidity("A number must be provided.");
                }
                if (choice2.length == 0){
                    textInput2.setCustomValidity('A number must be provided.');
                }
                if (Number(choice) > Number(choice2)){
                    textInput1.setCustomValidity('The minimum of the range must be lower than the maximum.');
                }
                if (textInput1.checkValidity() && textInput2.checkValidity()){
                    clickEnabled = false;
                    event.data.obj.skipEnabled = false;
                    event.data.obj._clickEvent(choice, choice2, params);
                } else {
                    textInput1.reportValidity();
                textInput2.reportValidity();
                }
            }
        });

    };

    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, choice2, params) {

        let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];
        if (this.exp.online) {
            sendToDB(0,
            {
                exp: this.exp.expName,
                expID: this.exp.expID,
                id: this.exp.subID,
                test: +(this.exp.isTesting),
                season: this.cm.seasonNum,
                trial: this.cm.trialNum,
                min: choice,
                max: choice2,
                reaction_time: reactionTime,
                session: this.cm.sessionNum,
                choice_time: choiceTime - this.exp.initTime,
            },
            'php/InsertRange.php'
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
                        event.obj.cm.next();
                        //event.obj.nextFunc(event.obj.nextParams);
                    }, 500, {obj: event.obj})
                }, this.feedbackDuration, {obj: this}
            );
        }
    };
}
