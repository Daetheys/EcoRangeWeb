<?php

include 'connectDB.php';

$EXPID = stripslashes(htmlspecialchars($_POST['expID']));
$ID = stripslashes(htmlspecialchars($_POST['id']));
$EXP = stripslashes(htmlspecialchars($_POST['exp']));
$MINREW = stripslashes(htmlspecialchars($_POST['minRew']));
$MAXREW = stripslashes(htmlspecialchars($_POST['maxRew']));
$RANKS = stripslashes(htmlspecialchars($_POST['ranks']));
$REWARDS = stripslashes(htmlspecialchars($_POST['rewards']));
$SEASONID = stripslashes(htmlspecialchars($_POST['seasonID']));

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_season VALUE(?,?,?,?,?,?,?,?,NOW())");
$stmt->bind_param("sssiissi",$EXPID,$ID,$EXP,$MINREW,$MAXREW,$RANKS,$REWARDS,$SEASONID);
$stmt->execute();
$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
