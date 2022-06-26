<?php
	$out = exec("python3 gen.py",$output,$res);	
	file_put_contents("log.txt",'-'.$res.'-'.$out.'-'.$output[0]);
	echo json_encode($output);
?>
