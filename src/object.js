function Object(id, category) {
	this.id = id;
	this.model = null;
	this.visual = null;
	this.category = category;

	this.x = 1;
	this.y = 1;
	this.z = 1;

	this.preloadMedia = async function(driver) {
		if (this.model == null) {
			return ;
		}
		this.visual = new Model(this.model, driver);
		await this.visual.load();

		if (this.visual.textures != null) {
			for (let i = 0; i < this.visual.textures.length; i++) {
				this.visual.textures[i].id = await loadTexture(
					driver.gl,
					removeFilenameFromPath("assets/Stranded II/" + this.model) + this.visual.textures[i].path);
			}
		}
	};
}
