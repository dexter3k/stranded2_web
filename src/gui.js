function Gui(driver) {
    this.driver = driver;
    this.bmpf = new Bmpf(driver);
    this.strings = new Strings();

    // map[textureName]glTexture
    var textures = {};

    this.loadFonts = async function() {
        await this.bmpf.load();
    };

    this.loadStrings = async function() {
        await this.strings.load();
    };

    this.preloadMedia = async function() {
        textures = await loadTextures(driver.gl, "assets/Stranded II/", [
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
    };
}
