<?php

include 'connectDB.php';

$EXPID = stripslashes(htmlspecialchars($_POST['expID']));
$ID = stripslashes(htmlspecialchars($_POST['id']));
$EXP = stripslashes(htmlspecialchars($_POST['exp']));
$TEXTT = stripslashes(htmlspecialchars($_POST['text'])); 

$stmt = $db->prepare("INSERT INTO nicolas_ecorange_quest VALUE(?,?,?,?,NOW())");
$stmt->bind_param("ssss",$EXPID,$ID,$EXP,$TEXTT);
$stmt->execute();
$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
