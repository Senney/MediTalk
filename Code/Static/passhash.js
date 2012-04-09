function submitForm(fieldName, storage, formName) {
	var pwUn = document.getElementById(fieldName);
	var pw = document.getElementById(storage);
	if (pw != undefined && pwUn.value.length == 0) {
		return;
	}
	
	pw.value = hex_sha256(pwUn.value);
	document.getElementById(formName).submit();
}
