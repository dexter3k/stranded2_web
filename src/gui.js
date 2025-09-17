class GuiElement {
    constructor(x, y, w, h) {
        this.rect = [x, y, x+w, y+h];
    }

    isMouseInside(mx, my) {
        return mx >= this.x && mx < this.rect[2] && my >= this.y && my < this.rect[3];
    }

    get x() {
        return this.rect[0];
    }

    get y() {
        return this.rect[1];
    }

    get width() {
        return this.rect[2] - this.x;
    }

    get height() {
        return this.rect[3] - this.y;
    }

    draw(gui) {}

    update() {}
}

class GuiImage extends GuiElement {
    constructor(x, y, tex) {
        super(x, y, tex.width, tex.height);

        this.texture = tex;
    }

    draw(gui) {
        gui.driver.drawImage(this.rect, [0, 0],
            [this.texture.width, this.texture.height], this.texture.id);
    }
}

class GuiCenteredImage extends GuiElement {
    constructor(x, y, tex) {
        super(
            x - tex.width / 2, y - tex.height / 2,
            tex.width, tex.height);

        this.texture = tex;
    }

    draw(gui) {
        gui.driver.drawImage(this.rect, [0, 0],
            [this.texture.width, this.texture.height], this.texture.id);
    }
}

class GuiButton extends GuiElement {
    constructor(x, y, txt, cb, icon=-1, enabled=true) {
        super(x, y, 190, 45);

        this.normalImage = null;
        this.overImage = null;

        this.txt = txt;
        this.icon = icon;
        this.enabled = enabled;

        this.callback = cb;

        this.hovered = false;
        this.pressed = false;
    }

    draw(gui) {
        if (this.normalImage == null) {
            this.normalImage = new GuiImage(this.x, this.y, gui.textures["sys/gfx/bigbutton.bmp"]);
        }
        if (this.overImage == null) {
            this.overImage = new GuiImage(this.x, this.y, gui.textures["sys/gfx/bigbutton_over.bmp"]);
        }

        if (!this.enabled) {
            throw "todo";
        }

        // Handle input
        const [mx, my] = [gui.input.getMouseX(), gui.input.getMouseY()];
        this.hovered = this.isMouseInside(mx, my);

        if (this.pressed && this.hovered && gui.input.wasLeftMouseButtonJustReleased()) {
            this.pressed = false;

            if (this.callback) {
                this.callback();
            }
        }

        if (this.hovered && gui.input.wasLeftMouseButtonJustPressed()) {
            this.pressed = true;
        } else if (!gui.input.isLeftMouseButtonPressed()) {
            this.pressed = false;
        }

        (this.hovered ? this.overImage : this.normalImage).draw(gui);

        const offset = this.pressed ? 1 : 0;

        if (this.icon >= 0) {
            gui.drawIcon(this.x + 5 + offset, this.y + 6 + offset, this.icon);
        }

        gui.bmpf.centeredText(
            this.x + (this.width/2) + offset,
            this.y + (this.height/2) + offset - gui.bmpf.defaultHeight / 2,
            this.txt, this.hovered ? 1 : 0);
    }
}

class GuiWindow extends GuiElement {
    constructor(x, y, title, icon) {
        super(x, y, 580, 595);

        this.icon = icon;
        this.title = title;
    }

    draw(gui) {
        // gfx_win
        {
            const tex = gui.textures["sys/gfx/woodback_dark.bmp"];
            gui.driver.drawImage(this.rect, [0, 0], [tex.width, tex.height], tex.id, {
                repeat: true,
            });

            const hori = gui.textures["sys/gfx/border_hori.bmp"];
            gui.driver.drawImage(
                [this.x, this.y + 579, this.x + this.width, this.y + 579 + hori.height],
                [0, 0],
                [hori.width, hori.height],
                hori.id,
                { repeat: true },
            );

            const vert = gui.textures["sys/gfx/border_vert.bmp"];
            gui.driver.drawImage(
                [this.x, this.y, this.x + vert.width, this.y + this.height],
                [0, 0],
                [vert.width, vert.height],
                vert.id,
                { repeat: true },
            );
            gui.driver.drawImage(
                [this.x + 564, this.y, this.x + 564 + vert.width, this.y + this.height],
                [0, 0],
                [vert.width, vert.height],
                vert.id,
                { repeat: true },
            );

            gui.drawImage("sys/gfx/border_corn.bmp", this.x, this.y + 579);
            gui.drawImage("sys/gfx/border_corn.bmp", this.x + 564, this.y + 579);
        }

        // Title Icon
        gui.drawIcon(this.x + 21, this.y + 5, this.icon);

        // Title text
        gui.bmpf.text(this.x + 21 + 37, this.y + 10, this.title, 0);

        // gfx_winbar
        {
            const hori = gui.textures["sys/gfx/border_hori.bmp"];
            gui.driver.drawImage(
                [this.x, this.y + 42, this.x + this.width, this.y + 42 + hori.height],
                [0, 0],
                [hori.width, hori.height],
                hori.id,
                { repeat: true },
            );
            gui.drawImage("sys/gfx/border_corn.bmp", this.x, this.y + 42);
            gui.drawImage("sys/gfx/border_corn.bmp", this.x + 564, this.y + 42);
        }
    }
}

class GuiText extends GuiElement {
    constructor(x, y, text) {
        super(x, y, 100, 100);

        this.text = text;
    }

    draw(gui) {
        gui.bmpf.text(this.x, this.y, this.text, 0);
    }
}

class GuiRadio extends GuiElement {
    constructor(gui, x, y, text, group, value) {
        super(x, y, 16 + 3 + gui.bmpf.text_width(text, 0), 16);

        this.text = text;
        this.group = group;
        this.value = value;
    }

    draw(gui) {
        const [mx, my] = [gui.input.getMouseX(), gui.input.getMouseY()];
        const hovered = this.isMouseInside(mx, my);

        if (hovered) {
            gui.drawImage("sys/gfx/opt_over.bmp", this.x, this.y);
        } else {
            gui.drawImage("sys/gfx/opt.bmp", this.x, this.y);
        }

        if (hovered && gui.input.wasLeftMouseButtonJustReleased()) {
            gui.radio_groups.set(this.group, this.value);
        }

        const selected = gui.radio_groups.get(this.group) == this.value;
        if (selected) {
            gui.drawImage("sys/gfx/opt_sel.bmp", this.x, this.y);
        }

        gui.bmpf.text(this.x + 16 + 3, this.y + 8 - Math.floor(gui.bmpf.defaultHeight / 2), this.text, hovered ? 1 : 0);
    }
}

class Gui {
    constructor(driver, input) {
        this.driver = driver;
        this.input = input;
        this.bmpf = new Bmpf(driver);
        this.strings = null;
        this.textures = {};

        this.scene = [];
        this.radio_groups = new Map();
    }

    clearScene() {
        this.scene = [];
        this.radio_groups = new Map();
    }

    drawImage(name, x, y) {
        const img = new GuiImage(x, y, this.textures[name]);
        img.draw(this);
    }

    drawCenteredImage(name, x, y) {
        const img = new GuiCenteredImage(x, y, this.textures[name]);
        img.draw(this);
    }

    drawIcon(x, y, idx, passive=false) {
        const tex = this.textures[passive ? "sys/gfx/icons_passive.bmp" : "sys/gfx/icons.bmp"];
        const tiles = Math.floor(tex.width / 32);
        const sx = idx % tiles;
        const sy = Math.floor(idx / tiles);
        this.driver.drawImage([x, y, x + 32, y + 32], [sx * 32, sy * 32], [tex.width, tex.height], tex.id);
    }

    addRadio(x, y, title, group, value) {
        if (!this.radio_groups.has(group)) {
            this.radio_groups.set(group, value);
        }
        this.scene.push(new GuiRadio(this, x, y, title, group, value));
    }

    addText(x, y, text) {
        this.scene.push(new GuiText(x, y, text));
    }

    addWindow(x, y, title, icon) {
        this.scene.push(new GuiWindow(x, y, title, icon));
    }

    addCenteredImage(name, x, y) {
        this.scene.push(new GuiCenteredImage(x, y, this.textures[name]));
    }

    addButton(x, y, txt, cb=null, icon=-1, enabled=true) {
        this.scene.push(new GuiButton(x, y, txt, cb, icon, enabled));
    }

    update() {
        for (const elem of this.scene) {
            elem.update();
        }
    }

    render() {
        for (const elem of this.scene) {
            elem.draw(this);
        }

        this.input.updatePostRender();
    }

    async loadFonts() {
        await this.bmpf.load();
    }

    async preloadMedia() {
        this.textures = await loadTextures(this.driver.gl, "assets/Stranded II/", [
            "sys/gfx/bigbutton.bmp",
            "sys/gfx/bigbutton_over.bmp",
            "sys/gfx/iconbutton.bmp",
            "sys/gfx/iconbutton_over.bmp",
            "sys/gfx/check.bmp",
            "sys/gfx/check_over.bmp",
            "sys/gfx/check_sel.bmp",
            "sys/gfx/opt.bmp",
            "sys/gfx/opt_over.bmp",
            "sys/gfx/opt_sel.bmp",
            "sys/gfx/slider.bmp",
            "sys/gfx/slider_over.bmp",
            "sys/gfx/slider_sel.bmp",
            "sys/gfx/slider_sec.bmp",
            "sys/gfx/input_left.bmp",
            "sys/gfx/input_left_over.bmp",
            "sys/gfx/input_middle.bmp",
            "sys/gfx/input_middle_over.bmp",
            "sys/gfx/input_right.bmp",
            "sys/gfx/input_right_over.bmp",
            "sys/gfx/scroll.bmp",
            "sys/gfx/scroll_over.bmp",
            "sys/gfx/scroll_bar_top.bmp",
            "sys/gfx/scroll_bar_middle.bmp",
            "sys/gfx/scroll_bar_bottom.bmp",
            "sys/gfx/edscrollspace.bmp",
            "sys/gfx/icons.bmp",
            "sys/gfx/icons_passive.bmp",
            "sys/gfx/defaulticon.bmp",
            "sys/gfx/border_corn.bmp",
            "sys/gfx/border_hori.bmp",
            "sys/gfx/border_vert.bmp",
            "sys/gfx/cursor.bmp",
            "sys/gfx/cursor_height.bmp",
            "sys/gfx/cursor_move.bmp",
            "sys/gfx/cursor_paint.bmp",
            "sys/gfx/cursor_rotate.bmp",
            "sys/gfx/cursor_text.bmp",
            "sys/gfx/cursor_crosshair.bmp",
            "sys/gfx/woodback.bmp",
            "sys/gfx/woodback_dark.bmp",
            "sys/gfx/paperback.bmp",
            "sys/gfx/progress_small.bmp",
            "sys/gfx/progress_hunger.bmp",
            "sys/gfx/progress_thirst.bmp",
            "sys/gfx/progress_exhaustion.bmp",
            "sys/gfx/if_barback.bmp",
            "sys/gfx/if_itemback.bmp",
            "sys/gfx/if_itemshade.bmp",
            "sys/gfx/if_values.bmp",
            "sys/gfx/if_weapon.bmp",
            "sys/gfx/if_compass.bmp",
            "sys/gfx/state.bmp",
            "sys/gfx/states.bmp",
            "sys/gfx/arrows.bmp",
            "sys/gfx/title.bmp",
            "sys/gfx/editor_x.bmp",
            "sys/gfx/editor_y.bmp",
            "sys/gfx/editor_z.bmp",
            "sys/gfx/editor_sel.bmp",
            "sys/gfx/tutor.bmp",
            "sys/gfx/terrainstructure.bmp",
            "sys/gfx/structure.bmp",
            "sys/gfx/terraindirt.bmp",
            "sys/gfx/rain_a.bmp",
            "sys/gfx/snow_a.bmp",

            "sys/gfx/logo.bmp"
        ]);
    }
}
