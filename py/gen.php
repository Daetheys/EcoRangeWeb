<?php
	exec("python3 py/gen.py",$output);
	echo $output[0];
?>
