function doAllWithCounter(work, progressCallback) {
	progressCallback(0);

	let done = 0;
	for (const w of work) {
		w.then(()=> {
			done++;

			progressCallback(done);
		});
	}
	return Promise.all(work);
}
