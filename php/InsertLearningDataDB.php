<?php

include 'connectDB.php';

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$TEST 		= stripslashes(htmlspecialchars($_POST['test']));
$SEASON		= stripslashes(htmlspecialchars($_POST['season']));
$TRIAL 		= stripslashes(htmlspecialchars($_POST['trial']));
$CHOICE 	= stripslashes(htmlspecialchars($_POST['choice']));
$REW 		= stripslashes(htmlspecialchars($_POST['reward']));
$RANK 		= stripslashes(htmlspecialchars($_POST['rank']));
$RTIME 		= stripslashes(htmlspecialchars($_POST['reaction_time']));
$REWTOT		= stripslashes(htmlspecialchars($_POST['rewardTot']));
$SESSION 	= stripslashes(htmlspecialchars($_POST['session']));
$CTIME 		= stripslashes(htmlspecialchars($_POST['choice_time']));

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_data VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("sssiiiiiidiid",
    $EXP, $EXPID, $ID, $TEST, $SEASON, $TRIAL, $CHOICE, $REW, $RANK, $RTIME, $REWTOT, $SESSION, $CTIME
);
$stmt->execute();
$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
