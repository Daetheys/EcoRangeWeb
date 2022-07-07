<?php

include 'connectDB.php';

$data = $db->query("SELECT ENVID FROM nicolas_ecorange_exp");

$db->close();

echo json_encode($data);

?>