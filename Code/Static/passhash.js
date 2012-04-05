function submitForm(fieldName, formName) {
	var pw = document.getElementById(fieldName);
	if (pw != undefined && pw.value.length == 0) {
		return;
	}
	
	pw.value = hex_sha256(pw.value);
	console.log("Hash: " + pw.value);
	document.getElementById(formName).submit();
}
