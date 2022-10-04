<?php

include 'connectDB.php';

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$TEST 		= stripslashes(htmlspecialchars($_POST['test']));
$SEASON		= stripslashes(htmlspecialchars($_POST['season']));
$TRIAL 		= stripslashes(htmlspecialchars($_POST['trial']));
$VALUE 	    = stripslashes(htmlspecialchars($_POST['value']));
$INITV      = stripslashes(htmlspecialchars($_POST['initv']));
$RTIME 		= stripslashes(htmlspecialchars($_POST['reaction_time']));
$SESSION 	= stripslashes(htmlspecialchars($_POST['session']));
$CTIME 		= stripslashes(htmlspecialchars($_POST['choice_time']));

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_slider VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("sssiiiiidid",
    $EXP, $EXPID, $ID, $TEST, $SEASON, $TRIAL, $VALUE, $INITV, $RTIME, $SESSION, $CTIME
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
