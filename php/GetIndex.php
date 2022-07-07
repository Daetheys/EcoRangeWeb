<?php

include 'connectDB.php';

$maxi = 80;
$val = 0;
$query= $db->query("SELECT ENVID FROM nicolas_ecorange_exp");
while($data = $query->fetch_row()){
    $val = (int)$data[0];
    if ($val > $maxi){
       $maxi = $val;
    }
}

$db->close();

echo json_encode($maxi);

?>