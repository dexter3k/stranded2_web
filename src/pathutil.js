function removeFilenameFromPath(str) {
	let sepf = str.lastIndexOf("/");
	let sepb = str.lastIndexOf("\\");
	if (sepf > sepb) {
		return str.substring(0, sepf) + "/";
	}
	return str.substring(0, sepb) + "/";
}
