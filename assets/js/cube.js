/* *
 * cube.js: Demo Script by Jack Dybczak.
 *
 * Aug 25th, 2015
 * First implementation with hardcoded values for the demo.
 *
 * Sep 9th, 2015
 * Added move_by() to Cube & CubeSet classes to allow relative movement.
 *
 * Oct 21st, 2015
 * Small documentation update.
 * */

/**
 * Global common objects.
 */
var CUBE_TEMPLATE = "div.cube_template";                 //Template element.
var CUBE_WORLD = "div.world";                            //3D space element.
var Z_POSITION = -300;                                   //Initial z-position for cubes (px).
var CUBE_SIDES = ["front", "back", "left", "right", "top", "bottom"];


/**
 * CubeSet: group of cubes.
 * @returns {CubeSet} - set of cubes.
 */
var CubeSet = (function() {

    /**
     * CubeSet()
     * @constructor
     */
    function CubeSet() {
        this.cubes = [];
    };



    /**
     * create_new_cube(): create a new cube within the set (wrapper for Cube.create_cube()).
     * @param {int} cube_id - new id for the new cube.
     * @param {int} x, y, z - coordinates of where the cube should be initially placed.
     * @returns {Cube} - returns cube object after creation.
     */
    CubeSet.prototype.create_new_cube = function(cube_id, x, y, z) {
        var cube_index = this.cubes.length || 0;
        this.cubes[cube_index] = new Cube(cube_id, x, y, z);
        return this.cubes[cube_index];
    };



    /**
     * show_results(): display results with cubes.
     * @param query_text - query text to be passed to the search engine.
     * @param param_obj - additional parameters to be sent as parameters to the callback function that is receiving search results.
     * @param results_callback_fn - callback function.
     */
    CubeSet.prototype.show_results = function(query_text, param_obj, results_callback_fn) {
        var self = this;

        var my_feed = new FeedMiner("http://ajax.googleapis.com/ajax/services/search/images?v=1.0&as_filetype=jpg&safe=active&q=" + encodeURIComponent(query_text), function(results) {
            results_callback_fn(self, query_text, results, param_obj);
        });

        //Clean up.
        my_feed = null;
    };



    /**
     * perform_group_action(): get all the cubes to do something as a group.
     * @param action - group action to be performed by all cubes.
     * @param params - for action "set_face_side", params.new_side contains the side of the cube all cubes should switch to.
     *               - for action "move_by", params.x, params.y, params.z contain coordinates for cubes to be moved by.
     */
    CubeSet.prototype.perform_group_action = function(action, params) {
        if (action.length > 0) {
            var cubes = this.cubes;

            if (cubes.length > 0) {
                for (var ci = 0; ci < cubes.length; ci++) {
                    var this_cube = cubes[ci];

                    switch(action) {
                        case "move_by":
                            this_cube.move_by(params.x, params.y, params.z);
                            break;

                        case "set_face_side":
                            this_cube.set_face_side(params.new_side);
                            break;

                        case "show_next_side":
                            this_cube.show_next_side();
                            break;

                        case "show_prev_side":
                            this_cube.show_prev_side();
                            break;

                        case "demo_start":
                            this_cube.demo();
                            break;

                        case "demo_stop":
                            this_cube.demo(true);
                            break;
                    }
                }
            }

            //Clean up.
            cubes = this_cube = null;
        }
    };

    return CubeSet;
})();



//Cube.
/**
 * Cube: Individual cube.
 * @returns {Cube} - cube object.
 */
var Cube = (function () {
    /**
     * Cube()
     * @param cube_id - new cube ID.
     * @param x - initial x position.
     * @param y - initial y position.
     * @param z - initial z position.
     * @constructor
     */
    function Cube(cube_id, x, y, z) {
        //Set defaults.
        this.cube_id = cube_id || Math.floor((Math.random() * 100000) + 1000);
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.transition_speed = 1;                                          //Default transition speed.
        this.backsides_visible = true;                                      //Default: transparency for back-sides.
        this.width = 0;
        this.height = 0;

        this.demo_timer = null;                                             //Holds demo timer for the object.
        this.create_cube(this.cube_id, this.x, this.y, this.z);             //Pointer to our cube html element.
        this.face_side = "front";                                           //Default face side (front of the cube) is "front".
    };



    /**
     * create_cube(): create a physical cube in the 3D plane.
     * @param cube_id - new cube ID.
     * @param x - initial x position.
     * @param y - initial y position.
     * @param z - initial z position.
     */
    //create(): create a cube and place it at x, y, z.
    Cube.prototype.create_cube = function(cube_id, x, y, z) {
        var new_cube = $(CUBE_TEMPLATE).clone();
        new_cube.removeClass("cube_template hidden");   //Prepare for cube deployment.
        $(CUBE_WORLD).append(new_cube);
        $(new_cube).attr("id", cube_id);
        this.cube_elem = "div#" + cube_id;                                  //Store pointer to cube element.

        this.width = this.get_width();
        this.height = this.get_height();
        this.move_to(x, y, z);                                              //Move cube to initial x, y, z position.

        //Clean up.
        new_cube = null;
    };



    /**
     * delete(): delete the cube object.
     *
     */
    //delete(): remove the object.
    Cube.prototype.delete = function() {
        this.cube_id = this.cube_elem = this.x = this.y = this.z = this.backsides_visible = this.width = this.height = this.demo_timer = this.face_side = null;
        $(this.cube_elem).remove();
    };



    /**
     * transform_cube(): render the cube transformations based on the object properties set.
     */
    //transform_cube(): transform cube taking into account current x, y, z + new requested position.
    Cube.prototype.transform_cube = function() {
        var x_pos = 0, y_pos = 0, z_pos = 0, rot_str = "";

        switch(this.face_side) {
            case "front":
                x_pos = this.x;
                y_pos = this.y;
                break;

            case "back":
                x_pos = this.x;
                y_pos = this.y;
                rot_str = "rotateX(-180deg)";
                break;

            case "right":
                x_pos = this.x;
                y_pos = this.y;
                rot_str = "rotateY(-90deg)";
                break;

            case "left":
                x_pos = this.x;
                y_pos = this.y;
                rot_str = "rotateY(90deg)";
                break;

            case "top":
                x_pos = this.x;
                y_pos = this.y;
                rot_str = "rotateX(-90deg)";
                break;

            case "bottom":
                x_pos = this.x;
                y_pos = this.y;
                rot_str = "rotateX(90deg)";
                break;

            default:
                x_pos = this.x;
                y_pos = this.y;
                break;
        }

        z_pos = Z_POSITION + this.z;
        $(this.cube_elem).css("transform", "translateZ(" + z_pos + "px) translateX(" + x_pos + "px) translateY(" + y_pos + "px)" + rot_str);

        //Clear up references.
        x_pos = y_pos = z_pos = rot_str = null;
    };



    /**
     * get_x(): return x-coord.
     * @returns {int} x-coordinate.
     */
    Cube.prototype.get_x = function() {
        return this.x;
    };



    /**
     * get_y(): return y-coord.
     * @returns {int} y-coordinate.
     */
    Cube.prototype.get_y = function() {
        return this.y;
    };



    /**
     * get_z(): return z-coord.
     * @returns {int} z-coordinate.
     */
    Cube.prototype.get_z = function() {
        return this.z;
    };



    /**
     * get_width(): get cube width.
     * @returns {int} width.
     */
    Cube.prototype.get_width = function() {
        return $(this.cube_elem).find("figure").css("width");
    };



    /**
     * get_height(): get cube height.
     * @returns {int} width.
     */
    Cube.prototype.get_height = function() {
        return $(this.cube_elem).find("figure").css("height");
    };



    /**
     * move_by(): move cube by (x, y, z) units to the new destination.
     * @param x - number of x units to move cube by.
     * @param y - number of y units to move cube by.
     * @param z - number of z units to move cube by.
     */
    Cube.prototype.move_by = function(x, y, z) {
        if (x != undefined) this.x += x;
        if (y != undefined) this.y += y;
        if (z != undefined) this.z += z;
        this.render();
    };



    /**
     * move_to(): move cube to position x, y, z.
     * @param x - new x coordinate.
     * @param y - new y coordinate.
     * @param z - new z coordinate.
     */
    Cube.prototype.move_to = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.render();
    };



    /**
     * show_face_side(): set face to new side.
     * @param new_side - cube will rotate to face this new side (see CUBE_SIDES).
     */
    Cube.prototype.set_face_side = function(new_side) {
        this.face_side = new_side;
        this.render();
    };



    /**
     * show_backsides(): show backsides (transparency).
     * @param flag - show or hide back sides of the cube.
     */
    Cube.prototype.show_backsides = function(flag) {
        (! flag)? $(this.cube_elem).addClass("backsides_invisible"): $(this.cube_elem).removeClass("backsides_invisible");
        this.backsides_visible = flag;
    };



    /**
     * render(): transform the cube.
     */
    Cube.prototype.render = function() {
        this.transform_cube();                  //Render changes.
        //$(CUBE_WORLD).hide().show(0);           //Bug fix for Z-axis.
    };



    /**
     * set_content(): set html content to specific side.
     * @param side - which side should have content added.
     * @param html_content - html content to be displayed on the side specified.
     */
    Cube.prototype.set_content = function(side, html_content) {
        $(this.cube_elem).find("." + side + " div.pcontent").html(html_content);
    };



    /**
     * show_next_side(): rotate to next side from the current face.
     */
    Cube.prototype.show_next_side = function() {
        this.set_face_side(CUBE_SIDES[(CUBE_SIDES.indexOf(this.face_side) + 1) % CUBE_SIDES.length]);
    };



    /**
     * show_prev_side(): rotate to previous side from current face.
     */
    Cube.prototype.show_prev_side = function() {
        this.set_face_side(CUBE_SIDES[(CUBE_SIDES.indexOf(this.face_side) + 1) % CUBE_SIDES.length]);
    };



    /**
     * report_coords(): show coordinates of the cube (debug function).
     */
    Cube.prototype.report_coords = function() {
        console.log("Cube ID: " + this.cube_id + ", X: " + this.x + ", Y: " + this.y + ", Z: " + this.z);
    };



    /**
     * set_event_handler(): sets event handlers for the cube (wrapper).
     * @param event - which event do we want to handle.
     * @param callback - callback function (receiving event and the active cube as parameters).
     */
    Cube.prototype.set_event_handler = function(event, callback) {
        var self = this;
        $(this.cube_elem).off(event).on(event, function(e) {
            callback(e, self);
        });
    };



    /**
     * demo(): dancing cube demo - keep rotating cubes until stop parameter is set to false.
     * @param stop - stop parameter to determine if demo should continue.
     */
    Cube.prototype.demo = function(stop) {
        if (stop != undefined)                  //Stop demo.
            clearInterval(this.demo_timer);
        else {                                  //Start demo.
            var self = this;
            var next_side_index = 0;        //Start demo with front side.

            this.demo_timer = setInterval(function () {
                self.set_face_side(CUBE_SIDES[next_side_index]);
                next_side_index = (next_side_index + 1) % CUBE_SIDES.length;      //Go to the next one.
            }, 1000);
        }
    };

    return Cube;     //Return the object itself.
})();