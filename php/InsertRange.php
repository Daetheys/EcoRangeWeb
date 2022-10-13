<?php

include 'connectDB.php';

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$TEST 		= stripslashes(htmlspecialchars($_POST['test']));
$SEASON		= stripslashes(htmlspecialchars($_POST['season']));
$TRIAL 		= stripslashes(htmlspecialchars($_POST['trial']));
$MIN 	    = stripslashes(htmlspecialchars($_POST['min']));
$MAX        = stripslashes(htmlspecialchars($_POST['max']));
$RTIME 		= stripslashes(htmlspecialchars($_POST['reaction_time']));
$SESSION 	= stripslashes(htmlspecialchars($_POST['session']));
$CTIME 		= stripslashes(htmlspecialchars($_POST['choice_time']));

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_range VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("sssiiissdid",
    $EXP, $EXPID, $ID, $TEST, $SEASON, $TRIAL, $MIN, $MAX, $RTIME, $SESSION, $CTIME
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
