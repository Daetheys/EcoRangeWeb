<?php

include 'connectDB.php';

$maxint = stripslashes(htmlspecialchars($_POST['maxInt']));
$maxit = 5;

for ($i=0; $i<$maxit; $i++){
	$index = random_int(0,$maxint);
    $query= $db->query("SELECT ENVID FROM nicolas_ecorange_exp WHERE ENVID==" . strval($index));
    if($query->fetch_row())
    	continue;
	break;
}

$db->close();

echo json_encode($index);

?>