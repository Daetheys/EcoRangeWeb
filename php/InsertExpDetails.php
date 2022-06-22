<?php

include 'connectDB.php';

$EXPID = stripslashes(htmlspecialchars($_POST['expID']));
$ID = stripslashes(htmlspecialchars($_POST['id']));
$EXP = stripslashes(htmlspecialchars($_POST['exp']));
$CONV = stripslashes(htmlspecialchars($_POST['conversionRate']));
$BROW = stripslashes(htmlspecialchars($_POST['browser']));
$MINREWS = stripslashes(htmlspecialchars($_POST['minRews']));
$MAXREWS = stripslashes(htmlspecialchars($_POST['maxRews']));
$NSEASONS = stripslashes(htmlspecialchars($_POST['nSeasons']));
$NTRIALSPERSEASON = stripslashes(htmlspecialchars($_POST['nTrialsPerSeason']));
$NARMS = stripslashes(htmlspecialchars($_POST['nArms']));

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_exp VALUE(?,?,?,?,?,?,?,?,?,?,NOW())");
$stmt->bind_param("ssssdssiii",$EXPID,$ID,$EXP,$BROW, $CONV,$MINREWS,$MAXREWS,$NSEASONS,$NTRIALSPERSEASON,$NARMS);
$stmt->execute();
$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
